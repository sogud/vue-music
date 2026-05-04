import { app, BrowserWindow } from 'electron'
import { initializeDatabase } from './storage/db'
import { registerAllIpcHandlers } from './ipc/register-ipc'
import { createMainWindow } from './window'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  initializeDatabase()
  registerAllIpcHandlers()
  mainWindow = createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

export function getMainWindow() {
  return mainWindow
}
