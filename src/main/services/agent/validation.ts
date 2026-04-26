import { z } from 'zod'

const CreationThemeSchema = z.object({
  title: z.string(),
  description: z.string(),
  moodTags: z.array(z.string()),
  genreTags: z.array(z.string())
})

const CreationDirectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  moodTags: z.array(z.string()).min(1),
  genreTags: z.array(z.string()).min(1),
  musicPrompt: z.string().min(20),
  lyricTheme: z.string().min(1),
  coverPrompt: z.string().min(10)
})

export const SongAnalysisOutputSchema = z.object({
  summary: z.string().min(1),
  moodTags: z.array(z.string()).min(1),
  genreTags: z.array(z.string()).min(1),
  lyricThemes: z.array(z.string()),
  inspirationPoints: z.array(z.string()).min(1),
  avoidPoints: z.array(z.string()).min(1),
  recommendedThemes: z.array(CreationThemeSchema).min(1).max(3)
})

export const DirectionsOutputSchema = z.object({
  directions: z.array(CreationDirectionSchema).length(3)
})

export function parseAgentJson<T>(raw: string, schema: z.ZodSchema<T>): T | null {
  // Step 1: Try direct JSON.parse
  try {
    return schema.parse(JSON.parse(raw))
  } catch {
    // continue
  }

  // Step 2: Try extracting JSON code block
  const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (blockMatch) {
    try {
      return schema.parse(JSON.parse(blockMatch[1].trim()))
    } catch {
      // continue
    }
  }

  // Step 3: Try finding any JSON object in the text
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return schema.parse(JSON.parse(jsonMatch[0]))
    } catch {
      // continue
    }
  }

  return null
}
