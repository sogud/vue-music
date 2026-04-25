import axios from 'axios'
import { appConfig } from '../config'
import type { AgentAnalysisPayload, Song } from '@shared/types'

export async function analyzeSongWithPiAgent(song: Song): Promise<AgentAnalysisPayload | null> {
  if (!appConfig.piAgentApiKey) return null

  try {
    const { data } = await axios.post<{ result: AgentAnalysisPayload }>(
      `${appConfig.piAgentBaseUrl}/v1/agent/analyze-song`,
      {
        model: appConfig.piAgentModel,
        input: {
          title: song.title,
          artist: song.artist,
          album: song.album,
          tags: song.tags,
          lyricSnippet: song.lyricSnippet
        }
      },
      {
        headers: { Authorization: `Bearer ${appConfig.piAgentApiKey}` },
        timeout: 5000
      }
    )

    return data.result
  } catch {
    return null
  }
}
