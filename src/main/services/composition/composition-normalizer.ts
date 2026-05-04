import type { Composition, CompositionTrack, DrumTrack, InstrumentTrack, NoteEvent } from '@shared/types'
import { createId } from '../../utils/ids'
import { assertValidComposition } from './composition-validator'

const requiredRoles: Array<CompositionTrack['role']> = ['drums', 'bass', 'chords', 'melody']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function round3(value: number) {
  return Number(value.toFixed(3))
}

function truncate(value: string | undefined, max: number) {
  if (!value) return undefined
  return value.length > max ? value.slice(0, max) : value
}

function normalizeNote(note: NoteEvent): NoteEvent {
  return {
    pitch: clamp(Math.round(note.pitch), 0, 127),
    start: round3(note.start),
    duration: round3(note.duration),
    velocity: clamp(Math.round(note.velocity), 1, 127)
  }
}

function normalizeTrack(track: CompositionTrack, index: number): CompositionTrack {
  const notes = track.notes.map(normalizeNote)
  if (track.type === 'drums') {
    return {
      ...track,
      id: createId(),
      name: truncate(track.name, 60) ?? `Drums ${index + 1}`,
      channel: 9,
      volume: clamp(Math.round(track.volume), 0, 127),
      pan: clamp(track.pan, -64, 64),
      notes
    } satisfies DrumTrack
  }

  return {
    ...track,
    id: createId(),
    name: truncate(track.name, 60) ?? `Track ${index + 1}`,
    program: clamp(Math.round(track.program), 0, 127),
    volume: clamp(Math.round(track.volume), 0, 127),
    pan: clamp(track.pan, -64, 64),
    notes
  } satisfies InstrumentTrack
}

export function normalizeComposition(input: Composition): Composition {
  const roles = new Set<CompositionTrack['role']>(input.tracks.map((track) => track.role))
  for (const role of requiredRoles) {
    if (!roles.has(role)) throw new Error(`缺少必要轨道：${role}`)
  }

  const now = Date.now()
  const normalized: Composition = {
    ...input,
    id: createId(),
    title: (truncate(input.title.trim(), 80) || 'Untitled Composition') as string,
    description: truncate(input.description?.trim(), 300),
    bpm: clamp(Math.round(input.bpm), 60, 160),
    createdAt: now,
    updatedAt: now,
    tracks: input.tracks.map(normalizeTrack)
  }

  assertValidComposition(normalized)
  return normalized
}
