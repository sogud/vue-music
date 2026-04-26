import { ipcMain } from 'electron'
import { z } from 'zod'
import { createFromInspiration, createFromIdea, listProjects, getProject } from '../services/creation/creation-service'
import type { CreateFromInspirationInput, CreateFromIdeaInput } from '@shared/types'

const CreateFromInspirationSchema = z.object({
  inspirationId: z.string().min(1),
  userIdea: z.string().optional()
})
const CreateFromIdeaSchema = z.object({
  userIdea: z.string().min(1)
})
const IdSchema = z.string().min(1)

export function registerCreationIpc() {
  ipcMain.handle('musedesk:creation:createFromInspiration', async (_event, input: CreateFromInspirationInput) => {
    return createFromInspiration(CreateFromInspirationSchema.parse(input))
  })

  ipcMain.handle('musedesk:creation:createFromIdea', async (_event, input: CreateFromIdeaInput) => {
    return createFromIdea(CreateFromIdeaSchema.parse(input))
  })

  ipcMain.handle('musedesk:creation:list', async () => {
    return listProjects()
  })

  ipcMain.handle('musedesk:creation:get', async (_event, id: string) => {
    return getProject(IdSchema.parse(id))
  })
}
