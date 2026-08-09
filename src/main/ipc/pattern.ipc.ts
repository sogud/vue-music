import { ipcMain } from 'electron'
import { z } from 'zod'
import { aiService } from '../services/ai/ai-service'

const GeneratePatternSchema = z.object({
  idea: z.string().min(1).max(1000),
  style: z.string().max(200).optional(),
  bpm: z.number().int().min(60).max(160).optional(),
  bars: z.number().int().min(1).max(32).optional()
})

export function registerPatternIpc() {
  ipcMain.handle('pattern:generate', (_event, input) => aiService.generatePattern(GeneratePatternSchema.parse(input)))
}
