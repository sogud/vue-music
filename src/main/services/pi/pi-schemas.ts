import { z } from 'zod'

export const AnalyzeSongSchema = z.object({
  summary: z.string().min(1),
  moodTags: z.array(z.string()).default([]),
  genreTags: z.array(z.string()).default([]),
  lyricThemes: z.array(z.string()).default([]),
  inspirationPoints: z.array(z.string()).default([]),
  avoidPoints: z.array(z.string()).default([]),
  creationSuggestions: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        moodTags: z.array(z.string()).default([]),
        genreTags: z.array(z.string()).default([])
      })
    )
    .min(1)
})

export const NoteEventSchema = z.object({
  pitch: z.number().int().min(0).max(127),
  start: z.number().min(0),
  duration: z.number().positive(),
  velocity: z.number().int().min(1).max(127)
})

export const InstrumentTrackSchema = z.object({
  id: z.string(),
  type: z.literal('instrument'),
  name: z.string().min(1),
  role: z.enum(['chords', 'bass', 'melody', 'pad', 'lead']),
  channel: z.number().int().min(0).max(15).refine((value) => value !== 9, 'instrument channel 不能是 9'),
  program: z.number().int().min(0).max(127),
  volume: z.number().int().min(0).max(127),
  pan: z.number().min(-64).max(64),
  notes: z.array(NoteEventSchema).max(512)
})

export const DrumTrackSchema = z.object({
  id: z.string(),
  type: z.literal('drums'),
  name: z.string().min(1),
  role: z.literal('drums'),
  channel: z.literal(9),
  volume: z.number().int().min(0).max(127),
  pan: z.number().min(-64).max(64),
  notes: z.array(NoteEventSchema).max(512)
})

export const CompositionTrackSchema = z.discriminatedUnion('type', [InstrumentTrackSchema, DrumTrackSchema])

export const CompositionSchema = z.object({
  version: z.literal('1.0'),
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  bpm: z.number().min(60).max(160),
  timeSignature: z.tuple([z.literal(4), z.literal(4)]),
  key: z.string().min(1),
  bars: z.number().int().min(4).max(32),
  tracks: z.array(CompositionTrackSchema).min(4).max(8),
  createdAt: z.number(),
  updatedAt: z.number()
})

export const GenerateCompositionSchema = z.object({
  composition: CompositionSchema
})
