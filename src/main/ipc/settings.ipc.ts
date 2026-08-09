import { ipcMain } from 'electron'
import { z } from 'zod'
import { aiService } from '../services/ai/ai-service'
import { musicService } from '../services/music/music-service'
import { renderService } from '../services/render/render-service'
import { settingsService } from '../services/settings/settings-service'
import { openRouterService } from '../services/ai/openrouter-service'

const KeySchema = z.string().min(1)
const SetSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})
const SECRET_SETTING_KEYS = new Set(['ai.apiKey'])
const AiConfigSchema = z.object({
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(160),
  apiKey: z.string().max(4096).optional(),
  baseUrl: z.string().max(500).optional()
})
const OpenRouterOAuthSchema = z.object({
  code: z.string().min(1).max(4096),
  codeVerifier: z.string().min(32).max(256)
})

export function registerSettingsIpc() {
  ipcMain.handle('settings:get', (_event, key) => {
    const parsed = KeySchema.parse(key)
    if (SECRET_SETTING_KEYS.has(parsed)) return null
    return settingsService.get(parsed)
  })
  ipcMain.handle('settings:set', (_event, input) => {
    const parsed = SetSchema.parse(input)
    if (SECRET_SETTING_KEYS.has(parsed.key)) {
      throw new Error('Secret settings must be updated through the dedicated secure API.')
    }
    settingsService.set(parsed.key, parsed.value)
  })
  ipcMain.handle('settings:configureAi', (_event, input) => {
    const parsed = AiConfigSchema.parse(input)
    settingsService.set('ai.provider', parsed.provider)
    settingsService.set('ai.model', parsed.model)
    settingsService.set('ai.baseUrl', parsed.baseUrl ?? '')
    if (typeof parsed.apiKey === 'string' && parsed.apiKey.length > 0) {
      settingsService.set('ai.apiKey', parsed.apiKey)
    }
  })
  ipcMain.handle('settings:exchangeOpenRouterCode', (_event, input) =>
    openRouterService.exchangeOAuthCode(OpenRouterOAuthSchema.parse(input))
  )
  ipcMain.handle('settings:listOpenRouterFreeModels', () => openRouterService.listFreeModels())
  ipcMain.handle('settings:getAll', () => settingsService.getAll())
  ipcMain.handle('settings:testNetease', () => musicService.testNetease())
  ipcMain.handle('settings:testAi', () => aiService.test())
  ipcMain.handle('settings:testPi', () => aiService.test())
  ipcMain.handle('settings:testRenderer', () => renderService.checkTools())
}
