import { ipcMain } from 'electron'
import { registerPlayerIpc } from './player.ipc'
import { registerTrackIpc } from './track.ipc'
import { registerAnalysisIpc } from './analysis.ipc'
import { registerInspirationIpc } from './inspiration.ipc'
import { registerCreationIpc } from './creation.ipc'
import { registerSettingsIpc } from './settings.ipc'

export function registerAllIpcHandlers() {
  registerPlayerIpc()
  registerTrackIpc()
  registerAnalysisIpc()
  registerInspirationIpc()
  registerCreationIpc()
  registerSettingsIpc()
}
