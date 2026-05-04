import type { Composition } from '@shared/types'
import { analysisRepository } from '../../storage/repositories/analysis.repository'
import { inspirationRepository } from '../../storage/repositories/inspiration.repository'
import { validateComposition } from './composition-validator'
import { normalizeComposition } from './composition-normalizer'
import { piAgentService } from '../pi/pi-agent-service'
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
    const aiOutput = await piAgentService.generateComposition({
      idea: input.idea,
      bars: input.bars,
      bpm: input.bpm,
      style: input.style,
      sourceAnalysis: sourceAnalysis ?? undefined
    })
    const composition = normalizeComposition(aiOutput.composition as Composition)
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
