import { ipcMain } from 'electron'
import { z } from 'zod'
import { musicService } from '../services/music/music-service'
import { piAgentService } from '../services/pi/pi-agent-service'
import { renderService } from '../services/render/render-service'
import { settingsService } from '../services/settings/settings-service'

const KeySchema = z.string().min(1)
const SetSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})

export function registerSettingsIpc() {
  ipcMain.handle('settings:get', (_event, key) => settingsService.get(KeySchema.parse(key)))
  ipcMain.handle('settings:set', (_event, input) => {
    const parsed = SetSchema.parse(input)
    settingsService.set(parsed.key, parsed.value)
  })
  ipcMain.handle('settings:getAll', () => settingsService.getAll())
  ipcMain.handle('settings:testNetease', () => musicService.testNetease())
  ipcMain.handle('settings:testPi', () => piAgentService.test())
  ipcMain.handle('settings:testRenderer', () => renderService.checkTools())
}
