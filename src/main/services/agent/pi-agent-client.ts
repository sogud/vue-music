import axios from 'axios'
import { appConfig } from '../../config'
import { SongAnalysisOutputSchema, DirectionsOutputSchema, parseAgentJson } from './validation'
import type { AgentClient } from './agent-client'
import type { AnalyzeSongAgentInput, AnalyzeSongAgentOutput, GenerateDirectionsAgentInput, GenerateDirectionsAgentOutput } from '@shared/types'
import { analyzeSongPrompt, generateCreationDirectionsPrompt } from './prompts'

export class PiAgentClient implements AgentClient {
  private get apiKey() {
    return appConfig.piAgentApiKey
  }

  private get baseUrl() {
    return appConfig.piAgentBaseUrl
  }

  async analyzeSong(input: AnalyzeSongAgentInput): Promise<AnalyzeSongAgentOutput> {
    if (!this.apiKey) {
      throw new Error('Pi Agent API key not configured')
    }

    try {
      const { data } = await axios.post<{ result: unknown }>(
        `${this.baseUrl}/v1/agent/analyze-song`,
        {
          model: appConfig.piAgentModel,
          input: {
            title: input.title,
            artist: input.artist,
            lyric: input.lyric,
            userNote: input.userNote
          },
          systemPrompt: analyzeSongPrompt
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 30000
        }
      )

      // Try to validate structured output, or parse from text
      const validated = SongAnalysisOutputSchema.safeParse(data.result)
      if (validated.success) return validated.data

      // Try parsing from raw text if result is a string
      if (typeof data.result === 'string') {
        const parsed = parseAgentJson(data.result, SongAnalysisOutputSchema)
        if (parsed) return parsed
      }

      throw new Error('AI 输出格式异常，已使用基础分析结果')
    } catch (err) {
      throw new Error(`Pi Agent analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  async generateCreationDirections(input: GenerateDirectionsAgentInput): Promise<GenerateDirectionsAgentOutput> {
    if (!this.apiKey) {
      throw new Error('Pi Agent API key not configured')
    }

    try {
      const { data } = await axios.post<{ result: unknown }>(
        `${this.baseUrl}/v1/agent/generate-directions`,
        {
          model: appConfig.piAgentModel,
          input: {
            track: input.track,
            analysis: input.analysis,
            userIdea: input.userIdea
          },
          systemPrompt: generateCreationDirectionsPrompt
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 30000
        }
      )

      const validated = DirectionsOutputSchema.safeParse(data.result)
      if (validated.success) return validated.data

      if (typeof data.result === 'string') {
        const parsed = parseAgentJson(data.result, DirectionsOutputSchema)
        if (parsed) return parsed
      }

      throw new Error('AI 输出格式异常，已使用基础分析结果')
    } catch (err) {
      throw new Error(`Pi Agent directions generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
}
