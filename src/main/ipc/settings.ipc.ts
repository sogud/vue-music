import { ipcMain } from 'electron'
import { z } from 'zod'
import { getSetting, setSetting } from '../services/settings/settings-service'

const KeySchema = z.string().min(1)
const ValueSchema = z.string()

export function registerSettingsIpc() {
  ipcMain.handle('musedesk:settings:get', async (_event, key: string) => {
    return getSetting(KeySchema.parse(key))
  })

  ipcMain.handle('musedesk:settings:set', async (_event, key: string, value: string) => {
    return setSetting(KeySchema.parse(key), ValueSchema.parse(value))
  })
}
