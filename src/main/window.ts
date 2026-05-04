import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'

const isDev = !!process.env.ELECTRON_RENDERER_URL

export function createMainWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    autoHideMenuBar: true,
    backgroundColor: '#F8F6F2',
    title: 'OtoDesk',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL!)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
