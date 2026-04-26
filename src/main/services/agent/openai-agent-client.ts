import axios from 'axios'
import { appConfig } from '../../config'
import { getSetting } from '../settings/settings-service'
import { analyzeSongPrompt, generateCreationDirectionsPrompt } from './prompts'
import { DirectionsOutputSchema, SongAnalysisOutputSchema } from './validation'
import type { AgentClient } from './agent-client'
import type {
  AnalyzeSongAgentInput,
  AnalyzeSongAgentOutput,
  GenerateDirectionsAgentInput,
  GenerateDirectionsAgentOutput
} from '@shared/types'

class AgentError extends Error {}

export class OpenAIAgentClient implements AgentClient {
  private get baseUrl() {
    return getSetting('agent.openai.baseUrl') ?? appConfig.openaiBaseUrl
  }

  private get apiKey() {
    return getSetting('agent.openai.apiKey') ?? appConfig.openaiApiKey
  }

  private get model() {
    return getSetting('agent.openai.model') ?? appConfig.openaiModel
  }

  async analyzeSong(input: AnalyzeSongAgentInput): Promise<AnalyzeSongAgentOutput> {
    const content = await this.chatJson(analyzeSongPrompt, input)
    return SongAnalysisOutputSchema.parse(content)
  }

  async generateCreationDirections(input: GenerateDirectionsAgentInput): Promise<GenerateDirectionsAgentOutput> {
    const content = await this.chatJson(generateCreationDirectionsPrompt, input)
    return DirectionsOutputSchema.parse(content)
  }

  private async chatJson(system: string, userPayload: unknown): Promise<unknown> {
    if (!this.apiKey.trim()) {
      throw new AgentError('AI 助手未配置，请在设置中填写 API Key 和模型。')
    }

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: JSON.stringify(userPayload) }
          ]
        },
        {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new AgentError('Agent returned empty content')
      return JSON.parse(text)
    } catch (error) {
      if (error instanceof AgentError) throw error
      throw new AgentError('AI 返回格式异常，请重试。')
    }
  }
}
