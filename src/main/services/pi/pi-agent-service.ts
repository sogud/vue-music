import type {
  AnalyzeSongInput,
  AnalyzeSongOutput,
  GenerateCompositionInput,
  GenerateCompositionOutput
} from '@shared/types'
import { analyzeSongPrompt, generateCompositionPrompt } from './pi-prompts'
import { AnalyzeSongSchema, GenerateCompositionSchema } from './pi-schemas'
import { piAgentClient } from './pi-agent-client'

export class PiAgentService {
  analyzeSong(input: AnalyzeSongInput): Promise<AnalyzeSongOutput> {
    return piAgentClient.runJson(
      {
        systemPrompt: analyzeSongPrompt,
        input
      },
      AnalyzeSongSchema
    ).then((output) => ({
      summary: output.summary,
      moodTags: output.moodTags ?? [],
      genreTags: output.genreTags ?? [],
      lyricThemes: output.lyricThemes ?? [],
      inspirationPoints: output.inspirationPoints ?? [],
      avoidPoints: output.avoidPoints ?? [],
      creationSuggestions: output.creationSuggestions.map((suggestion) => ({
        title: suggestion.title,
        description: suggestion.description,
        moodTags: suggestion.moodTags ?? [],
        genreTags: suggestion.genreTags ?? []
      }))
    }))
  }

  generateComposition(input: GenerateCompositionInput): Promise<GenerateCompositionOutput> {
    return piAgentClient.runJson(
      {
        systemPrompt: generateCompositionPrompt,
        input
      },
      GenerateCompositionSchema
    )
  }

  test() {
    return piAgentClient.test()
  }
}

export const piAgentService = new PiAgentService()
