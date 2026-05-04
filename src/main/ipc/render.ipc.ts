import { ipcMain } from 'electron'
import { z } from 'zod'
import { renderService } from '../services/render/render-service'

export function registerRenderIpc() {
  ipcMain.handle('render:checkTools', () => renderService.checkTools())
  ipcMain.handle('render:renderProject', (_event, projectId) =>
    renderService.renderProject(z.string().min(1).parse(projectId))
  )
  ipcMain.handle('render:openOutputFolder', (_event, projectId) =>
    renderService.openOutputFolder(z.string().min(1).parse(projectId))
  )
}
