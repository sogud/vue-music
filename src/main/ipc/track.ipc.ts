import { ipcMain } from 'electron'
import { z } from 'zod'
import { getMusicProvider } from '../services/music-provider'
import { getDb, saveTrack } from '../db'

const SearchSchema = z.string().min(0)
const ResolveTrackSchema = z.object({
  source: z.literal('netease'),
  sourceId: z.string().min(1)
})
const TrackIdSchema = z.string().min(1)

export function registerTrackIpc() {
  ipcMain.handle('musedesk:tracks:searchTracks', async (_event, query: string) => {
    SearchSchema.parse(query)
    const provider = getMusicProvider()
    return provider.searchTracks(query)
  })

  ipcMain.handle('musedesk:tracks:resolveTrack', async (_event, input: { source: 'netease'; sourceId: string }) => {
    const parsed = ResolveTrackSchema.parse(input)
    const provider = getMusicProvider()
    const track = await provider.getTrackDetail(parsed.sourceId)
    saveTrack(track)
    return track
  })

  ipcMain.handle('musedesk:tracks:getLyric', async (_event, trackId: string) => {
    const parsedTrackId = TrackIdSchema.parse(trackId)
    const db = getDb()
    const row = db.prepare('SELECT source_id FROM tracks WHERE id = ?').get(parsedTrackId) as { source_id: string } | undefined
    if (!row) throw new Error('Track not found')
    const provider = getMusicProvider()
    return provider.getLyric(row.source_id)
  })

  ipcMain.handle('musedesk:tracks:getPlayableUrl', async (_event, trackId: string) => {
    const parsedTrackId = TrackIdSchema.parse(trackId)
    const db = getDb()
    const row = db.prepare('SELECT source_id FROM tracks WHERE id = ?').get(parsedTrackId) as { source_id: string } | undefined
    if (!row) throw new Error('Track not found')
    const provider = getMusicProvider()
    return provider.getPlayableUrl(row.source_id)
  })
}
