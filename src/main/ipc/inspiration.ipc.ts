import { ipcMain } from 'electron'
import { z } from 'zod'
import { saveInspiration, listInspirations, removeInspiration } from '../services/inspiration/inspiration-service'
import type { SaveInspirationInput } from '@shared/types'

const SaveInspirationSchema = z.object({
  trackId: z.string().min(1),
  analysisId: z.string().optional(),
  note: z.string().optional()
})
const IdSchema = z.string().min(1)

export function registerInspirationIpc() {
  ipcMain.handle('musedesk:inspiration:save', async (_event, input: SaveInspirationInput) => {
    return saveInspiration(SaveInspirationSchema.parse(input))
  })

  ipcMain.handle('musedesk:inspiration:list', async () => {
    return listInspirations()
  })

  ipcMain.handle('musedesk:inspiration:remove', async (_event, id: string) => {
    return removeInspiration(IdSchema.parse(id))
  })
}
