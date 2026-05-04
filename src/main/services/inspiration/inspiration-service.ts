import type { Inspiration } from '@shared/types'
import { analysisRepository } from '../../storage/repositories/analysis.repository'
import { inspirationRepository } from '../../storage/repositories/inspiration.repository'
import { trackRepository } from '../../storage/repositories/track.repository'
import { createId } from '../../utils/ids'

export class InspirationService {
  save(input: { trackId: string; analysisId?: string; note?: string }): Inspiration {
    const track = trackRepository.getById(input.trackId)
    if (!track) throw new Error('Track not found')
    const analysis = input.analysisId
      ? analysisRepository.getById(input.analysisId)
      : analysisRepository.getByTrack(input.trackId)

    const now = Date.now()
    return inspirationRepository.save({
      id: createId(),
      trackId: track.id,
      analysisId: analysis?.id,
      title: analysis?.creationSuggestions[0]?.title ?? `${track.title} 的创作灵感`,
      note: input.note,
      moodTags: analysis?.moodTags ?? [],
      genreTags: analysis?.genreTags ?? [],
      trackTitle: track.title,
      trackArtist: track.artist,
      createdAt: now,
      updatedAt: now
    })
  }

  list() {
    return inspirationRepository.list()
  }

  get(id: string) {
    return inspirationRepository.getById(id)
  }

  remove(id: string) {
    inspirationRepository.remove(id)
  }
}

export const inspirationService = new InspirationService()
