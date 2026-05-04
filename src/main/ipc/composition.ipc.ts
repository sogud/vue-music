import { ipcMain } from 'electron'
import { z } from 'zod'
import { compositionService } from '../services/composition/composition-service'

const GenerateFromIdeaSchema = z.object({
  idea: z.string().min(1),
  bars: z.number().int().min(4).max(32),
  bpm: z.number().min(60).max(160).optional(),
  style: z.string().optional(),
  sourceAnalysisId: z.string().optional(),
  sourceInspirationId: z.string().optional()
})

export function registerCompositionIpc() {
  ipcMain.handle('composition:generateFromIdea', (_event, input) =>
    compositionService.generateFromIdea(GenerateFromIdeaSchema.parse(input))
  )
  ipcMain.handle('composition:validate', (_event, composition) =>
    compositionService.validate(z.unknown().parse(composition))
  )
}
