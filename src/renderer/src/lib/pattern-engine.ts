import type { Composition, CompositionTrack } from '@shared/types'

export type PatternTrackType = 'drums' | 'bass' | 'lead' | 'chords'

export type PatternEvent = {
  track: string
  type: PatternTrackType
  sound: string
  pitch?: number
  drum?: string
  start: number
  duration: number
  velocity: number
}

export type ParsedPattern = {
  tempo: number
  scale: string
  bars: number
  events: PatternEvent[]
  tracks: Array<{ name: string; type: PatternTrackType; events: number }>
  errors: string[]
}

export type PatternRenderOptions = {
  durationSeconds?: number
}

type TrackDraft = {
  type: PatternTrackType
  rows: string[]
  notes?: string
  rhythm?: string
  sound?: string
}

const noteBase: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
}

const drumPitches: Record<string, number> = {
  kick: 36,
  snare: 38,
  hat: 42,
  clap: 39,
  perc: 45
}

const drumPreviewFrequencies: Record<string, number> = {
  kick: 48,
  snare: 180,
  hat: 520,
  clap: 260,
  perc: 360
}

export function parsePattern(source: string): ParsedPattern {
  const errors: string[] = []
  const events: PatternEvent[] = []
  const tracks = new Map<string, TrackDraft>()
  let tempo = 92
  let scale = 'A minor'
  let current: TrackDraft | null = null

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const section = line.match(/^(drums|bass|lead|chords):$/i)
    if (section) {
      current = { type: section[1].toLowerCase() as PatternTrackType, rows: [] }
      tracks.set(current.type, current)
      return
    }
    const tempoMatch = line.match(/^tempo\s+(\d+)$/i)
    if (tempoMatch) {
      tempo = clamp(Number(tempoMatch[1]), 40, 220)
      return
    }
    const scaleMatch = line.match(/^scale\s+(.+)$/i)
    if (scaleMatch) {
      scale = scaleMatch[1].trim()
      return
    }
    if (!current) {
      errors.push(`Line ${index + 1}: expected a section.`)
      return
    }
    if (current.type === 'drums') current.rows.push(line)
    else if (line.startsWith('notes ')) current.notes = line.slice(6).trim()
    else if (line.startsWith('rhythm ')) current.rhythm = line.slice(7).trim()
    else if (line.startsWith('sound ')) current.sound = line.slice(6).trim()
    else errors.push(`Line ${index + 1}: unknown command.`)
  })

  for (const track of tracks.values()) {
    if (track.type === 'drums') parseDrums(track, events, errors)
    else parseMelodic(track, events, errors)
  }

  const bars = Math.max(1, Math.ceil((events.reduce((max, event) => Math.max(max, event.start + event.duration), 0) || 4) / 4))

  return {
    tempo,
    scale,
    bars,
    events,
    tracks: Array.from(tracks.values()).map((track) => ({
      name: track.type,
      type: track.type,
      events: events.filter((event) => event.track === track.type).length
    })),
    errors
  }
}

function parseDrums(track: TrackDraft, events: PatternEvent[], errors: string[]) {
  for (const row of track.rows) {
    const [name, ...patternParts] = row.split(/\s+/)
    const pattern = patternParts.join('')
    if (!name || !pattern) {
      errors.push(`Drum row "${row}" needs a name and pattern.`)
      continue
    }
    Array.from(pattern).forEach((char, index) => {
      if (char !== 'x' && char !== 'X') return
      events.push({
        track: track.type,
        type: 'drums',
        sound: name,
        drum: name,
        start: index * 0.25,
        duration: 0.16,
        velocity: name === 'hat' ? 0.42 : 0.82
      })
    })
  }
}

function parseMelodic(track: TrackDraft, events: PatternEvent[], errors: string[]) {
  if (!track.notes) {
    errors.push(`${track.type}: missing notes.`)
    return
  }
  const noteGroups = track.notes.split('|').map((group) => group.trim()).filter(Boolean)
  const rhythms = (track.rhythm || '1/2 1/2 1/2 1/2').split(/\s+/).map(parseDuration)
  let cursor = 0
  noteGroups.forEach((group, index) => {
    const duration = rhythms[index % rhythms.length] || 0.5
    const notes = group.split(/\s+/).map(noteToMidi).filter((note): note is number => note !== null)
    if (!notes.length) {
      errors.push(`${track.type}: could not parse notes "${group}".`)
      cursor += duration
      return
    }
    notes.forEach((pitch) => {
      events.push({
        track: track.type,
        type: track.type,
        sound: track.sound || defaultSound(track.type),
        pitch,
        start: cursor,
        duration,
        velocity: track.type === 'chords' ? 0.48 : 0.62
      })
    })
    cursor += duration
  })
}

function parseDuration(value: string) {
  const fraction = value.match(/^(\d+)\/(\d+)$/)
  if (fraction) return Number(fraction[1]) / Number(fraction[2])
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.5
}

function noteToMidi(value: string) {
  const match = value.match(/^([A-Ga-g])([#b]?)(-?\d)$/)
  if (!match) return null
  const name = `${match[1].toUpperCase()}${match[2]}`
  const octave = Number(match[3])
  const base = noteBase[name]
  if (base === undefined) return null
  return 12 * (octave + 1) + base
}

function defaultSound(type: PatternTrackType) {
  if (type === 'bass') return 'warm_bass'
  if (type === 'chords') return 'pad'
  return 'soft_sine'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export class PatternPlayer {
  private context: AudioContext | null = null
  private nodes: AudioNode[] = []
  private timer: number | null = null

  async play(pattern: ParsedPattern, options: PatternRenderOptions = {}) {
    this.stop()
    this.context = new AudioContext()
    await this.context.resume()
    const events = expandEvents(pattern, targetBarsForDuration(pattern.tempo, options.durationSeconds))
    const secondsPerBeat = 60 / pattern.tempo
    const startAt = this.context.currentTime + 0.08
    for (const event of events) {
      if (event.type === 'drums') this.scheduleDrum(event, startAt, secondsPerBeat)
      else this.scheduleTone(event, startAt, secondsPerBeat)
    }
    const endBeat = events.reduce((max, event) => Math.max(max, event.start + event.duration), 0)
    this.timer = window.setTimeout(() => this.stop(), (endBeat * secondsPerBeat + 0.8) * 1000)
  }

  stop() {
    if (this.timer !== null) window.clearTimeout(this.timer)
    this.timer = null
    this.nodes.forEach((node) => {
      try {
        node.disconnect()
      } catch {
        // Already disconnected.
      }
    })
    this.nodes = []
    if (this.context) void this.context.close()
    this.context = null
  }

  private scheduleTone(event: PatternEvent, startAt: number, secondsPerBeat: number) {
    if (!this.context || event.pitch === undefined) return
    const time = startAt + event.start * secondsPerBeat
    const duration = Math.max(0.08, event.duration * secondsPerBeat * 0.92)
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = event.sound.includes('bass') ? 'sawtooth' : event.sound.includes('pad') ? 'triangle' : 'sine'
    oscillator.frequency.value = 440 * 2 ** ((event.pitch - 69) / 12)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(event.velocity * 0.22, time + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    oscillator.connect(gain).connect(this.context.destination)
    oscillator.start(time)
    oscillator.stop(time + duration + 0.04)
    this.nodes.push(oscillator, gain)
  }

  private scheduleDrum(event: PatternEvent, startAt: number, secondsPerBeat: number) {
    if (!this.context) return
    const time = startAt + event.start * secondsPerBeat
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = event.drum === 'hat' ? 'square' : 'sine'
    oscillator.frequency.setValueAtTime(drumPreviewFrequencies[event.drum || 'perc'] ?? 240, time)
    oscillator.frequency.exponentialRampToValueAtTime(50, time + 0.12)
    gain.gain.setValueAtTime(event.velocity * 0.28, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (event.drum === 'hat' ? 0.045 : 0.16))
    oscillator.connect(gain).connect(this.context.destination)
    oscillator.start(time)
    oscillator.stop(time + 0.18)
    this.nodes.push(oscillator, gain)
  }
}

export function patternToComposition(
  pattern: ParsedPattern,
  title = 'Pattern Sketch',
  options: PatternRenderOptions = {}
): Composition {
  const now = Date.now()
  const bars = targetBarsForDuration(pattern.tempo, options.durationSeconds)
  const events = expandEvents(pattern, bars)
  const tracks: CompositionTrack[] = [
    {
      id: createClientId(),
      type: 'drums',
      name: 'Drums',
      role: 'drums',
      channel: 9,
      volume: 105,
      pan: 0,
      notes: events
        .filter((event) => event.type === 'drums')
        .map((event) => ({
          pitch: drumPitches[event.drum || 'perc'] ?? 45,
          start: round3(event.start),
          duration: round3(Math.max(0.125, event.duration)),
          velocity: toMidiVelocity(event.velocity)
        }))
    },
    makeInstrumentTrack(events, 'bass', 'Bass', 'bass', 1, 33, 96),
    makeInstrumentTrack(events, 'chords', 'Chords', 'chords', 2, 48, 78),
    makeInstrumentTrack(events, 'lead', 'Lead', 'melody', 3, 80, 88)
  ]

  return {
    version: '1.0',
    id: createClientId(),
    title: title.trim() || 'Pattern Sketch',
    description: 'Created from oto pattern.',
    bpm: clamp(Math.round(pattern.tempo), 60, 160),
    timeSignature: [4, 4],
    key: pattern.scale,
    bars,
    tracks,
    createdAt: now,
    updatedAt: now
  }
}

function makeInstrumentTrack(
  events: PatternEvent[],
  type: Exclude<PatternTrackType, 'drums'>,
  name: string,
  role: 'bass' | 'chords' | 'melody',
  channel: number,
  program: number,
  volume: number
): CompositionTrack {
  return {
    id: createClientId(),
    type: 'instrument',
    name,
    role,
    channel,
    program,
    volume,
    pan: 0,
    notes: events
      .filter((event) => event.type === type && event.pitch !== undefined)
      .map((event) => ({
        pitch: event.pitch ?? 60,
        start: round3(event.start),
        duration: round3(Math.max(0.125, event.duration)),
        velocity: toMidiVelocity(event.velocity)
      }))
  }
}

export function targetBarsForDuration(tempo: number, durationSeconds?: number) {
  if (!durationSeconds) return 4
  const beats = Math.ceil((durationSeconds * tempo) / 60)
  return clamp(Math.ceil(beats / 4), 4, 32)
}

export function durationForBars(tempo: number, bars: number) {
  return Math.round(((bars * 4 * 60) / tempo) * 10) / 10
}

function expandEvents(pattern: ParsedPattern, bars: number) {
  const sourceBeats = Math.max(
    1,
    pattern.events.reduce((max, event) => Math.max(max, event.start + event.duration), 0)
  )
  const targetBeats = bars * 4
  const output: PatternEvent[] = []
  for (let offset = 0; offset < targetBeats; offset += sourceBeats) {
    for (const event of pattern.events) {
      const start = event.start + offset
      if (start >= targetBeats) continue
      output.push({
        ...event,
        start: round3(start),
        duration: round3(Math.min(event.duration, targetBeats - start))
      })
    }
  }
  return output
}

function toMidiVelocity(value: number) {
  return clamp(Math.round(value * 127), 1, 127)
}

function round3(value: number) {
  return Number(value.toFixed(3))
}

function createClientId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
