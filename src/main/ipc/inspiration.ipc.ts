import { ipcMain } from 'electron'
import { z } from 'zod'
import { inspirationService } from '../services/inspiration/inspiration-service'

const SaveInspirationSchema = z.object({
  trackId: z.string().min(1),
  analysisId: z.string().optional(),
  note: z.string().optional()
})

export function registerInspirationIpc() {
  ipcMain.handle('inspiration:save', (_event, input) => inspirationService.save(SaveInspirationSchema.parse(input)))
  ipcMain.handle('inspiration:list', () => inspirationService.list())
  ipcMain.handle('inspiration:remove', (_event, id) => inspirationService.remove(z.string().min(1).parse(id)))
}
