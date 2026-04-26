import { ipcMain } from 'electron'
import { z } from 'zod'
import { analyzeTrack, getAnalysisByTrack } from '../services/analysis/song-analysis-service'
import type { AnalyzeTrackInput } from '@shared/types'

const AnalyzeTrackSchema = z.object({
  trackId: z.string().min(1),
  userNote: z.string().optional()
})
const TrackIdSchema = z.string().min(1)

export function registerAnalysisIpc() {
  ipcMain.handle('musedesk:analysis:analyzeTrack', async (_event, input: AnalyzeTrackInput) => {
    return analyzeTrack(AnalyzeTrackSchema.parse(input))
  })

  ipcMain.handle('musedesk:analysis:getByTrack', async (_event, trackId: string) => {
    return getAnalysisByTrack(TrackIdSchema.parse(trackId))
  })
}
