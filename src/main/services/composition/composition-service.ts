import type { Composition } from '@shared/types'
import { analysisRepository } from '../../storage/repositories/analysis.repository'
import { inspirationRepository } from '../../storage/repositories/inspiration.repository'
import { validateComposition } from './composition-validator'
import { normalizeComposition } from './composition-normalizer'
import { polishComposition } from './composition-arranger'
import { aiService } from '../ai/ai-service'
import { projectService } from '../project/project-service'

type GenerateFromIdeaInput = {
  idea: string
  bars: number
  bpm?: number
  style?: string
  sourceAnalysisId?: string
  sourceInspirationId?: string
}

export class CompositionService {
  validate(composition: unknown) {
    return validateComposition(composition)
  }

  async generateFromIdea(input: GenerateFromIdeaInput) {
    const sourceAnalysis = input.sourceAnalysisId ? analysisRepository.getById(input.sourceAnalysisId) : undefined
    const inspiration = input.sourceInspirationId ? inspirationRepository.getById(input.sourceInspirationId) : undefined
    const aiOutput = await aiService.generateComposition({
      idea: input.idea,
      bars: input.bars,
      bpm: input.bpm,
      style: input.style,
      sourceAnalysis: sourceAnalysis ?? undefined
    })
    const arrangementStyle = [
      input.style,
      sourceAnalysis?.moodTags.join(' '),
      sourceAnalysis?.genreTags.join(' '),
      sourceAnalysis?.lyricThemes.join(' ')
    ]
      .filter(Boolean)
      .join(' ')
    const aiComposition = aiOutput.composition as Composition
    const aiValidation = validateComposition(aiComposition)
    if (!aiValidation.ok) {
      throw new Error(`AI 返回的 composition 不可用：${aiValidation.errors.join('; ')}`)
    }

    const polished = polishComposition(aiComposition, {
      idea: input.idea,
      style: arrangementStyle
    })
    const composition = normalizeComposition(polished)
    return projectService.create({
      title: composition.title,
      description: composition.description,
      sourceTrackId: sourceAnalysis?.trackId ?? inspiration?.trackId,
      sourceInspirationId: inspiration?.id,
      userIdea: input.idea,
      composition
    })
  }
}

export const compositionService = new CompositionService()
