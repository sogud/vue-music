import { spawn } from 'node:child_process'
import { renderRepository } from '../../storage/repositories/render.repository'
import { createId } from '../../utils/ids'
import { getProjectPaths } from '../../utils/paths'
import { assertValidComposition } from '../composition/composition-validator'
import { midiService } from '../midi/midi-service'
import { projectService } from '../project/project-service'
import { fluidSynthRenderer } from './fluidsynth-renderer'
import { toolChecker } from './tool-checker'

export class RenderService {
  checkTools() {
    return toolChecker.checkRenderer()
  }

  async renderProject(projectId: string) {
    const project = projectService.requireProject(projectId)
    assertValidComposition(project.composition)
    const paths = getProjectPaths(project.id)
    await midiService.writeMidi(project.composition, paths.midiPath)
    await fluidSynthRenderer.render(paths.midiPath, paths.wavPath)

    return renderRepository.save({
      id: createId(),
      projectId: project.id,
      midiPath: paths.midiPath,
      wavPath: paths.wavPath,
      createdAt: Date.now()
    })
  }

  async openOutputFolder(projectId: string) {
    const project = projectService.requireProject(projectId)
    await openPath(getProjectPaths(project.id).dir)
  }
}

export const renderService = new RenderService()

function openPath(path: string) {
  if (process.versions.electron) {
    try {
      const electron = require('electron') as { shell?: { openPath(path: string): Promise<string> } }
      if (electron.shell) return electron.shell.openPath(path)
    } catch {
      // Fall through to platform command.
    }
  }

  const command =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer.exe' : 'xdg-open'
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, [path], { stdio: 'ignore', detached: true })
    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve()
    })
  })
}
