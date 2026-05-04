import { ipcMain } from 'electron'
import { z } from 'zod'
import { musicService } from '../services/music/music-service'

const QuerySchema = z.string()
const TrackIdSchema = z.string().min(1)
const ResolveTrackSchema = z.object({
  source: z.literal('netease'),
  sourceId: z.string().min(1)
})

export function registerMusicIpc() {
  ipcMain.handle('music:searchTracks', (_event, query) => musicService.searchTracks(QuerySchema.parse(query)))
  ipcMain.handle('music:resolveTrack', (_event, input) => musicService.resolveTrack(ResolveTrackSchema.parse(input)))
  ipcMain.handle('music:getLyric', (_event, trackId) => musicService.getLyric(TrackIdSchema.parse(trackId)))
  ipcMain.handle('music:getPlayableUrl', (_event, trackId) => musicService.getPlayableUrl(TrackIdSchema.parse(trackId)))
}
