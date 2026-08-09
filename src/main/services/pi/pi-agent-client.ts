import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { z } from 'zod'
import { settingsService } from '../settings/settings-service'
import { toErrorMessage } from '../../utils/errors'

type RunPiInput = {
  systemPrompt: string
  input: unknown
  timeoutMs?: number
}

type RpcResponse = {
  id: string
  type: 'response'
  command: string
  success: boolean
  data?: unknown
  error?: string
}

type RpcEvent = {
  type: string
  [key: string]: unknown
}

type RpcState = {
  model?: {
    id?: string
    provider?: string
  }
}

type PiLaunchConfig = {
  args: string[]
  env: NodeJS.ProcessEnv
}

const DEFAULT_TIMEOUT_MS = 120000
const RPC_RESPONSE_TIMEOUT_MS = 30000
const PiConnectivitySchema = z.object({
  ok: z.literal(true),
  message: z.string().min(1)
})
const PI_DISABLED_ARGS = [
  '--no-session',
  '--no-tools',
  '--no-extensions',
  '--no-skills',
  '--no-prompt-templates',
  '--no-context-files'
]

function buildPrompt(input: unknown) {
  return [
    '请只根据下面的输入完成任务。',
    '只输出最终 JSON，不要输出 markdown，不要解释，不要调用工具，不要写文件，不要执行命令。',
    '',
    '输入 JSON:',
    JSON.stringify(input, null, 2)
  ].join('\n')
}

function extractJson(text: string) {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Pi returned empty output')

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenced?.[1]?.trim() || trimmed

  try {
    return JSON.parse(candidate) as unknown
  } catch {
    const first = candidate.indexOf('{')
    const last = candidate.lastIndexOf('}')
    if (first >= 0 && last > first) {
      return JSON.parse(candidate.slice(first, last + 1)) as unknown
    }
    throw new Error(`Pi returned non-JSON output: ${candidate.slice(0, 300)}`)
  }
}

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'output'}: ${issue.message}`).join('; ')
}

class PiRpcSession {
  private child: ChildProcessWithoutNullStreams | null = null
  private buffer = ''
  private requestId = 0
  private stderr = ''
  private pending = new Map<
    string,
    {
      resolve: (response: RpcResponse) => void
      reject: (error: Error) => void
      timer: NodeJS.Timeout
    }
  >()
  private listeners = new Set<(event: RpcEvent) => void>()

  constructor(
    private readonly command: string,
    private readonly cwd: string | undefined,
    private readonly launchConfig: PiLaunchConfig,
    private readonly systemPrompt?: string
  ) {}

  async start() {
    if (this.child) throw new Error('Pi RPC session already started')

    const args = ['--mode', 'rpc', ...PI_DISABLED_ARGS, ...this.launchConfig.args]
    if (this.systemPrompt) {
      args.push('--system-prompt', this.systemPrompt)
    }

    this.child = spawn(this.command, args, {
      cwd: this.cwd,
      env: this.launchConfig.env,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    this.child.stdout.on('data', (chunk) => this.handleStdout(chunk.toString()))
    this.child.stderr.on('data', (chunk) => {
      this.stderr += chunk.toString()
    })
    this.child.on('error', (error) => {
      this.rejectAll(error)
    })
    this.child.on('close', (code) => {
      this.rejectAll(new Error(`Pi RPC exited with code ${code}. ${this.stderr.trim()}`.trim()))
    })

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 150)
      this.child?.once('error', (error) => {
        clearTimeout(timer)
        reject(error)
      })
      this.child?.once('close', (code) => {
        clearTimeout(timer)
        reject(new Error(`Pi RPC exited immediately with code ${code}. ${this.stderr.trim()}`.trim()))
      })
    })
  }

  stop() {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer)
    }
    this.pending.clear()
    this.listeners.clear()
    this.child?.kill('SIGTERM')
    this.child = null
  }

  getStderr() {
    return this.stderr
  }

  onEvent(listener: (event: RpcEvent) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async send(type: string, data: Record<string, unknown> = {}) {
    if (!this.child?.stdin.writable) throw new Error('Pi RPC session is not running')

    const id = `oto_${++this.requestId}`
    const payload = { ...data, id, type }
    return new Promise<RpcResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Timeout waiting for Pi RPC response to ${type}. ${this.stderr.trim()}`.trim()))
      }, RPC_RESPONSE_TIMEOUT_MS)
      this.pending.set(id, { resolve, reject, timer })
      this.child!.stdin.write(`${JSON.stringify(payload)}\n`)
    }).then((response) => {
      if (!response.success) throw new Error(response.error || `Pi RPC command failed: ${type}`)
      return response
    })
  }

  async promptAndWait(message: string, timeoutMs: number) {
    const waiter = this.createAgentEndWaiter(timeoutMs)
    try {
      await this.send('prompt', { message })
      await waiter.promise
    } catch (error) {
      waiter.cancel()
      throw error
    }
  }

  async getState() {
    const response = await this.send('get_state')
    return response.data as RpcState
  }

  async getLastAssistantText() {
    const response = await this.send('get_last_assistant_text')
    const data = response.data as { text?: unknown } | undefined
    return typeof data?.text === 'string' ? data.text : ''
  }

  private createAgentEndWaiter(timeoutMs: number) {
    let unsubscribe = () => {}
    let timer: NodeJS.Timeout | undefined

    const promise = new Promise<void>((resolve, reject) => {
      timer = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout waiting for Pi agent output. ${this.stderr.trim()}`.trim()))
      }, timeoutMs)

      unsubscribe = this.onEvent((event) => {
        if (event.type === 'agent_end') {
          if (timer) clearTimeout(timer)
          unsubscribe()
          resolve()
        }
      })
    })

    return {
      promise,
      cancel: () => {
        if (timer) clearTimeout(timer)
        unsubscribe()
      }
    }
  }

  private handleStdout(chunk: string) {
    this.buffer += chunk
    while (true) {
      const newlineIndex = this.buffer.indexOf('\n')
      if (newlineIndex === -1) return
      const line = this.buffer.slice(0, newlineIndex).replace(/\r$/, '')
      this.buffer = this.buffer.slice(newlineIndex + 1)
      if (line.trim()) this.handleLine(line)
    }
  }

  private handleLine(line: string) {
    let parsed: RpcResponse | RpcEvent
    try {
      parsed = JSON.parse(line) as RpcResponse | RpcEvent
    } catch {
      return
    }

    if (parsed.type === 'response' && 'id' in parsed && typeof parsed.id === 'string') {
      const pending = this.pending.get(parsed.id)
      if (!pending) return
      this.pending.delete(parsed.id)
      clearTimeout(pending.timer)
      pending.resolve(parsed as RpcResponse)
      return
    }

    for (const listener of this.listeners) listener(parsed as RpcEvent)
  }

  private rejectAll(error: Error) {
    for (const [id, pending] of this.pending) {
      this.pending.delete(id)
      clearTimeout(pending.timer)
      pending.reject(error)
    }
  }
}

export class PiAgentClient {
  async runJson<T>(task: RunPiInput, schema: z.ZodType<T>): Promise<T> {
    const output = this.mode === 'rpc' ? await this.runRpc(task) : await this.runPrint(task)
    const parsed = extractJson(output)
    const validated = schema.safeParse(parsed)
    if (!validated.success) {
      throw new Error(`Pi output format invalid: ${formatZodError(validated.error)}`)
    }
    return validated.data
  }

  async test() {
    let session: PiRpcSession | null = null
    try {
      const launchConfig = this.buildLaunchConfig()
      session = new PiRpcSession(this.command, this.workdir, launchConfig)
      await session.start()
      const state = await session.getState()
      const provider = state.model?.provider
      const model = state.model?.id
      if (!provider || !model || provider === 'unknown' || model === 'unknown') {
        return {
          ok: false,
          message:
            'Pi RPC 可启动，但没有可用模型。请在设置页填写 Provider、Model、API Key 和可选 Endpoint，保存后再测试。'
        }
      }
      await this.runJson(
        {
          systemPrompt: '你是 oto 的 Pi 连接测试器。你只能输出 JSON，不要输出 markdown。',
          input: {
            task: 'connectivity_check',
            requiredOutput: { ok: true, message: 'ready' }
          },
          timeoutMs: 60000
        },
        PiConnectivitySchema
      )
      return { ok: true, message: `Pi RPC 和 JSON roundtrip 可用：${provider}/${model}。` }
    } catch (error) {
      return {
        ok: false,
        message: `Pi 连接失败。请确认 Pi command 可执行，并检查设置页的 Provider、Model、API Key 和 Endpoint。${toErrorMessage(error)}`
      }
    } finally {
      session?.stop()
    }
  }

  private get command() {
    return settingsService.getPiCommand()
  }

  private get workdir() {
    return settingsService.getPiWorkdir()
  }

  private get mode() {
    return settingsService.getPiMode() === 'print' ? 'print' : 'rpc'
  }

  private buildLaunchConfig(): PiLaunchConfig {
    const provider = settingsService.getAiProvider().trim()
    const model = settingsService.getAiModel().trim()
    const apiKey = settingsService.getAiApiKey().trim()
    const baseUrl = settingsService.getAiBaseUrl().trim()
    const apiType = settingsService.getAiApiType().trim()
    const env = { ...process.env }
    const args: string[] = []

    if (!provider || !model) return { args, env }

    if (baseUrl) {
      env.OTODESK_AI_API_KEY = apiKey
      const customProvider = this.ensureCustomProvider({ provider, model, baseUrl, apiType })
      args.push('--provider', customProvider, '--model', model)
      return { args, env }
    }

    args.push('--provider', provider, '--model', model)
    if (apiKey) args.push('--api-key', apiKey)
    return { args, env }
  }

  private ensureCustomProvider(input: { provider: string; model: string; baseUrl: string; apiType: string }) {
    const providerName = `oto-${input.provider.toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'ai'}`
    const agentDir = join(homedir(), '.pi', 'agent')
    const modelsPath = join(agentDir, 'models.json')
    mkdirSync(agentDir, { recursive: true })

    let modelsConfig: Record<string, unknown> = {}
    if (existsSync(modelsPath)) {
      try {
        modelsConfig = JSON.parse(readFileSync(modelsPath, 'utf-8')) as Record<string, unknown>
      } catch {
        modelsConfig = {}
      }
    }

    const providers =
      typeof modelsConfig.providers === 'object' && modelsConfig.providers
        ? (modelsConfig.providers as Record<string, unknown>)
        : {}

    providers[providerName] = {
      baseUrl: input.baseUrl,
      api: input.apiType,
      apiKey: 'OTODESK_AI_API_KEY',
      compat:
        input.apiType === 'openai-completions'
          ? { supportsDeveloperRole: false, supportsReasoningEffort: false }
          : undefined,
      models: [{ id: input.model, name: input.model, input: ['text'], reasoning: false }]
    }

    writeFileSync(modelsPath, `${JSON.stringify({ ...modelsConfig, providers }, null, 2)}\n`, {
      mode: 0o600
    })
    return providerName
  }

  private async runRpc(task: RunPiInput) {
    const session = new PiRpcSession(
      this.command,
      this.workdir,
      this.buildLaunchConfig(),
      task.systemPrompt
    )
    try {
      await session.start()
      await session.promptAndWait(buildPrompt(task.input), task.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      const text = await session.getLastAssistantText()
      if (!text.trim()) {
        throw new Error(`Pi returned empty assistant text. ${session.getStderr().trim()}`.trim())
      }
      return text
    } finally {
      session.stop()
    }
  }

  private async runPrint(task: RunPiInput) {
    const launchConfig = this.buildLaunchConfig()
    const args = [
      '-p',
      ...PI_DISABLED_ARGS,
      ...launchConfig.args,
      '--system-prompt',
      task.systemPrompt,
      buildPrompt(task.input)
    ]
    return this.spawnAndCollect(args, task.timeoutMs ?? DEFAULT_TIMEOUT_MS, launchConfig.env)
  }

  private spawnAndCollect(args: string[], timeoutMs: number, env: NodeJS.ProcessEnv) {
    return new Promise<string>((resolve, reject) => {
      const child = spawn(this.command, args, {
        cwd: this.workdir,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''
      let settled = false
      const timeout = setTimeout(() => {
        if (settled) return
        settled = true
        child.kill('SIGTERM')
        reject(new Error(`Pi command timed out after ${timeoutMs}ms. ${stderr.trim()}`.trim()))
      }, timeoutMs)

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
      })
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
      child.on('error', (error) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        reject(error)
      })
      child.on('close', (code) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        if (code !== 0) {
          reject(new Error(stderr.trim() || `Pi exited with code ${code}`))
          return
        }
        resolve(stdout)
      })
    })
  }
}

export const piAgentClient = new PiAgentClient()
