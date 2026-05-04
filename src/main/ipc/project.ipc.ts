import { ipcMain } from 'electron'
import { z } from 'zod'
import { projectService } from '../services/project/project-service'
import { CompositionSchema } from '../services/composition/composition-validator'

const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  composition: CompositionSchema
})

const UpdateCompositionSchema = z.object({
  projectId: z.string().min(1),
  composition: CompositionSchema
})

export function registerProjectIpc() {
  ipcMain.handle('project:create', (_event, input) => projectService.create(CreateProjectSchema.parse(input)))
  ipcMain.handle('project:list', () => projectService.list())
  ipcMain.handle('project:get', (_event, id) => projectService.get(z.string().min(1).parse(id)))
  ipcMain.handle('project:updateComposition', (_event, input) => {
    const parsed = UpdateCompositionSchema.parse(input)
    return projectService.updateComposition(parsed.projectId, parsed.composition)
  })
  ipcMain.handle('project:remove', (_event, id) => projectService.remove(z.string().min(1).parse(id)))
}
