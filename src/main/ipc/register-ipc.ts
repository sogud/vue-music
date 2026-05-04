import { registerMusicIpc } from './music.ipc'
import { registerAnalysisIpc } from './analysis.ipc'
import { registerInspirationIpc } from './inspiration.ipc'
import { registerCompositionIpc } from './composition.ipc'
import { registerProjectIpc } from './project.ipc'
import { registerRenderIpc } from './render.ipc'
import { registerSettingsIpc } from './settings.ipc'

export function registerAllIpcHandlers() {
  registerMusicIpc()
  registerAnalysisIpc()
  registerInspirationIpc()
  registerCompositionIpc()
  registerProjectIpc()
  registerRenderIpc()
  registerSettingsIpc()
}
