import type { AgentAnalysisPayload, Song } from '@shared/types'

export async function analyzeSongWithMockAgent(song: Song): Promise<AgentAnalysisPayload> {
  return {
    mood: ['切ない', '静か', '透明感'],
    style: ['J-Pop', 'Dream Pop'],
    structure: ['Aメロ', 'サビ前の溜め', '開放感のあるサビ'],
    keywords: ['夏の終わり', '余白', '遠い光', song.artist],
    summary: `这首《${song.title}》呈现了低饱和、留白感很强的叙事气质，适合作为“温柔克制”的创作参考。`,
    recommendedThemes: ['夏の終わりの記憶', '光と影のコントラスト', '誰かを想う静かな時間']
  }
}
