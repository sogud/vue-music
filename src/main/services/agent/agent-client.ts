import type { AnalyzeSongAgentInput, AnalyzeSongAgentOutput, CreateFromIdeaInput, GenerateDirectionsAgentInput, GenerateDirectionsAgentOutput } from '@shared/types'

export interface AgentClient {
  analyzeSong(input: AnalyzeSongAgentInput): Promise<AnalyzeSongAgentOutput>
  generateCreationDirections(input: GenerateDirectionsAgentInput): Promise<GenerateDirectionsAgentOutput>
}
