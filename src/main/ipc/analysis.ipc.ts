import { ipcMain } from 'electron'
import { z } from 'zod'
import { analysisService } from '../services/analysis/analysis-service'

const AnalyzeTrackSchema = z.object({
  trackId: z.string().min(1),
  userNote: z.string().optional()
})

export function registerAnalysisIpc() {
  ipcMain.handle('analysis:analyzeTrack', (_event, input) => analysisService.analyzeTrack(AnalyzeTrackSchema.parse(input)))
  ipcMain.handle('analysis:getByTrack', (_event, trackId) =>
    analysisService.getByTrack(z.string().min(1).parse(trackId))
  )
}
