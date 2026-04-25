import type { AgentAnalysisPayload, Song } from '@shared/types'
import { analyzeSongWithMockAgent } from './mock-agent'
import { analyzeSongWithPiAgent } from './pi-agent'

export async function analyzeSong(song: Song): Promise<AgentAnalysisPayload> {
  const piResult = await analyzeSongWithPiAgent(song)
  if (piResult) return piResult
  return analyzeSongWithMockAgent(song)
}
