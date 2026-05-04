import type { SongAnalysis } from '@shared/types'
import { analysisRepository } from '../../storage/repositories/analysis.repository'
import { trackRepository } from '../../storage/repositories/track.repository'
import { createId } from '../../utils/ids'
import { musicService } from '../music/music-service'
import { piAgentService } from '../pi/pi-agent-service'

export class AnalysisService {
  async analyzeTrack(input: { trackId: string; userNote?: string }): Promise<SongAnalysis> {
    const track = trackRepository.getById(input.trackId)
    if (!track) throw new Error('Track not found')

    let lyric = track.lyric
    if (!lyric) {
      lyric = (await musicService.getLyric(track.id)) ?? undefined
    }

    const output = await piAgentService.analyzeSong({
      title: track.title,
      artist: track.artist,
      album: track.album,
      lyric,
      userNote: input.userNote
    })

    const now = Date.now()
    return analysisRepository.save({
      id: createId(),
      trackId: track.id,
      summary: output.summary,
      moodTags: output.moodTags,
      genreTags: output.genreTags,
      lyricThemes: output.lyricThemes,
      inspirationPoints: output.inspirationPoints,
      avoidPoints: output.avoidPoints,
      creationSuggestions: output.creationSuggestions.map((suggestion) => ({
        ...suggestion,
        id: createId()
      })),
      createdAt: now,
      updatedAt: now
    })
  }

  getByTrack(trackId: string) {
    return analysisRepository.getByTrack(trackId)
  }
}

export const analysisService = new AnalysisService()
