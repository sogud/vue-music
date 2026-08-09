import type { Composition, CompositionTrack, DrumTrack, InstrumentTrack, NoteEvent } from '@shared/types'

type Chord = {
  name: string
  root: number
  quality: 'major' | 'minor'
}

const noteNameToPitchClass: Record<string, number> = {
  c: 0,
  'c#': 1,
  db: 1,
  d: 2,
  'd#': 3,
  eb: 3,
  e: 4,
  f: 5,
  'f#': 6,
  gb: 6,
  g: 7,
  'g#': 8,
  ab: 8,
  a: 9,
  'a#': 10,
  bb: 10,
  b: 11
}

const majorScale = [0, 2, 4, 5, 7, 9, 11]
const minorScale = [0, 2, 3, 5, 7, 8, 10]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hashText(value: string) {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function parseKey(key: string) {
  const normalized = key.trim().toLowerCase()
  const [, note = 'a'] = normalized.match(/^([a-g](?:#|b)?)/) ?? []
  return {
    tonic: noteNameToPitchClass[note] ?? 9,
    minor: normalized.includes('minor') || normalized.includes('min') || normalized.includes('小调')
  }
}

function pitchFromPitchClass(pitchClass: number, octaveBase: number) {
  let pitch = octaveBase + pitchClass
  while (pitch < octaveBase) pitch += 12
  while (pitch >= octaveBase + 12) pitch -= 12
  return pitch
}

function makeChord(tonic: number, degree: number, minorMode: boolean): Chord {
  const scale = minorMode ? minorScale : majorScale
  const qualities: Array<'major' | 'minor'> = minorMode
    ? ['minor', 'minor', 'major', 'minor', 'minor', 'major', 'major']
    : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'minor']
  const index = ((degree % 7) + 7) % 7
  const root = (tonic + scale[index]) % 12
  return {
    name: `${index + 1}`,
    root,
    quality: qualities[index]
  }
}

function chooseProgression(seed: number, minorMode: boolean) {
  const minorProgressions = [
    [0, 5, 2, 6],
    [0, 3, 6, 4],
    [0, 6, 5, 4],
    [0, 2, 5, 6]
  ]
  const majorProgressions = [
    [0, 4, 5, 3],
    [0, 5, 3, 4],
    [0, 4, 1, 5],
    [3, 4, 0, 5]
  ]
  const options = minorMode ? minorProgressions : majorProgressions
  return options[seed % options.length]
}

function chordTones(chord: Chord, octaveBase: number) {
  const third = chord.quality === 'major' ? 4 : 3
  return [
    pitchFromPitchClass(chord.root, octaveBase),
    pitchFromPitchClass((chord.root + third) % 12, octaveBase),
    pitchFromPitchClass((chord.root + 7) % 12, octaveBase),
    pitchFromPitchClass((chord.root + 10) % 12, octaveBase + 12)
  ].sort((a, b) => a - b)
}

function addNote(notes: NoteEvent[], pitch: number, start: number, duration: number, velocity: number) {
  notes.push({
    pitch: clamp(Math.round(pitch), 0, 127),
    start: Number(start.toFixed(3)),
    duration: Number(duration.toFixed(3)),
    velocity: clamp(Math.round(velocity), 1, 127)
  })
}

function makeDrums(bars: number, style: string, seed: number): NoteEvent[] {
  const notes: NoteEvent[] = []
  const lofi = /lo.?fi|chill|ambient|夜|雨|soft/i.test(style)
  const dance = /city|funk|dance|electro|电子|future/i.test(style)
  for (let bar = 0; bar < bars; bar++) {
    const base = bar * 4
    addNote(notes, 36, base, 0.18, lofi ? 82 : 104)
    addNote(notes, 38, base + 2, 0.18, lofi ? 74 : 96)
    if (dance || bar % 2 === seed % 2) addNote(notes, 36, base + 3, 0.18, lofi ? 62 : 86)
    if (!lofi) addNote(notes, 36, base + 1.5, 0.16, 72)
    for (let step = 0; step < 8; step++) {
      const velocity = lofi ? (step % 2 === 0 ? 46 : 34) : step % 2 === 0 ? 66 : 50
      addNote(notes, step === 7 && dance ? 46 : 42, base + step * 0.5, 0.1, velocity)
    }
  }
  return notes
}

function makeBass(bars: number, chords: Chord[], bpm: number, style: string): NoteEvent[] {
  const notes: NoteEvent[] = []
  const sparse = bpm < 88 || /lo.?fi|ambient|ballad|慢|夜/i.test(style)
  for (let bar = 0; bar < bars; bar++) {
    const base = bar * 4
    const chord = chords[bar % chords.length]
    const root = pitchFromPitchClass(chord.root, 36)
    addNote(notes, root, base, sparse ? 1.5 : 0.95, sparse ? 82 : 92)
    addNote(notes, root + 12, base + 2, sparse ? 1 : 0.5, sparse ? 62 : 76)
    if (!sparse) {
      addNote(notes, root + 7, base + 2.75, 0.5, 70)
      addNote(notes, root, base + 3.5, 0.35, 78)
    }
  }
  return notes
}

function makeChords(bars: number, chords: Chord[], style: string): NoteEvent[] {
  const notes: NoteEvent[] = []
  const guitar = /guitar|folk|indie|吉他/i.test(style)
  for (let bar = 0; bar < bars; bar++) {
    const base = bar * 4
    const tones = chordTones(chords[bar % chords.length], guitar ? 48 : 52).slice(0, 3)
    for (const pitch of tones) {
      addNote(notes, pitch, base, 1.75, 64)
      addNote(notes, pitch, base + 2, 1.75, 58)
    }
    if (bar % 4 === 3) {
      for (const pitch of tones.slice(1)) addNote(notes, pitch + 12, base + 3.5, 0.35, 46)
    }
  }
  return notes
}

function makePad(bars: number, chords: Chord[], style: string): NoteEvent[] {
  const notes: NoteEvent[] = []
  const quiet = /lo.?fi|ambient|dream|夜|雨|安静|温柔/i.test(style)
  for (let bar = 0; bar < bars; bar += 2) {
    const base = bar * 4
    const tones = chordTones(chords[bar % chords.length], 60).slice(0, 3)
    for (const pitch of tones) {
      addNote(notes, pitch, base, Math.min(7.75, (bars - bar) * 4), quiet ? 34 : 42)
    }
  }
  return notes
}

function makeMelody(bars: number, chords: Chord[], key: ReturnType<typeof parseKey>, seed: number): NoteEvent[] {
  const notes: NoteEvent[] = []
  const scale = key.minor ? minorScale : majorScale
  const motif = seed % 3
  const patterns = [
    [
      [0, 0, 0.5, 72],
      [2, 0.75, 0.5, 70],
      [4, 1.5, 0.75, 76],
      [2, 2.75, 0.5, 66]
    ],
    [
      [4, 0.25, 0.75, 74],
      [5, 1.25, 0.5, 70],
      [4, 2, 0.5, 72],
      [1, 3, 0.75, 68]
    ],
    [
      [2, 0, 0.5, 70],
      [4, 0.5, 0.5, 74],
      [6, 1.5, 1, 76],
      [4, 3, 0.5, 68]
    ]
  ]

  for (let bar = 0; bar < bars; bar++) {
    const base = bar * 4
    const chord = chords[bar % chords.length]
    const chordTone = chordTones(chord, 60)
    const pattern = patterns[(motif + bar) % patterns.length]
    for (const [degree, offset, duration, velocity] of pattern) {
      const pitchClass = (key.tonic + scale[(degree + bar) % scale.length]) % 12
      let pitch = pitchFromPitchClass(pitchClass, 60)
      if (bar % 4 === 3 && offset >= 2) pitch = chordTone[0] + 12
      addNote(notes, pitch, base + offset, duration, velocity)
    }
  }
  return notes
}

function roleMinimumNotes(role: CompositionTrack['role'], bars: number) {
  if (role === 'drums') return bars * 6
  if (role === 'bass') return bars
  if (role === 'chords') return bars * 3
  if (role === 'melody') return Math.ceil(bars * 2)
  return 0
}

function isRequiredRole(role: CompositionTrack['role']) {
  return role === 'drums' || role === 'bass' || role === 'chords' || role === 'melody'
}

function humanizeNotes(notes: NoteEvent[], role: CompositionTrack['role'], seed: number, maxBeats: number) {
  if (role === 'chords' || notes.length === 0) return notes

  return notes.map((note, index) => {
    const driftSource = ((seed + index * 37) % 11) - 5
    const velocitySource = ((seed + index * 53) % 13) - 6
    const drift = role === 'drums' ? driftSource * 0.003 : driftSource * 0.005
    const start = clamp(note.start + drift, 0, Math.max(0, maxBeats - note.duration))
    return {
      ...note,
      start: Number(start.toFixed(3)),
      velocity: clamp(note.velocity + velocitySource, 1, 127)
    }
  })
}

function findTrack(input: Composition, role: CompositionTrack['role']) {
  return input.tracks.find((track) => track.role === role)
}

function instrumentTrack(input: Composition, role: InstrumentTrack['role'], fallback: Omit<InstrumentTrack, 'notes'>, notes: NoteEvent[]): InstrumentTrack {
  const existing = findTrack(input, role)
  return {
    ...fallback,
    id: existing?.id || fallback.id,
    name: existing?.name || fallback.name,
    volume: existing?.volume ?? fallback.volume,
    pan: existing?.pan ?? fallback.pan,
    notes
  }
}

export function arrangeComposition(input: Composition, context: { idea?: string; style?: string } = {}): Composition {
  const style = `${context.style ?? ''} ${input.description ?? ''} ${context.idea ?? ''}`
  const seed = hashText(`${input.title}:${input.key}:${style}`)
  const key = parseKey(input.key)
  const progression = chooseProgression(seed, key.minor)
  const chords = progression.map((degree) => makeChord(key.tonic, degree, key.minor))
  const bars = clamp(Math.round(input.bars), 4, 32)
  const bpm = clamp(Math.round(input.bpm), 60, 160)
  const drums = findTrack(input, 'drums') as DrumTrack | undefined

  const arrangedTracks: CompositionTrack[] = [
    {
      id: drums?.id || 'drums',
      type: 'drums',
      name: drums?.name || 'Drums',
      role: 'drums',
      channel: 9,
      volume: drums?.volume ?? 100,
      pan: drums?.pan ?? 0,
      notes: makeDrums(bars, style, seed)
    },
    instrumentTrack(
      input,
      'bass',
      { id: 'bass', type: 'instrument', name: 'Bass', role: 'bass', channel: 1, program: /synth|电子/i.test(style) ? 38 : 33, volume: 90, pan: 0 },
      makeBass(bars, chords, bpm, style)
    ),
    instrumentTrack(
      input,
      'chords',
      { id: 'chords', type: 'instrument', name: 'Keys', role: 'chords', channel: 2, program: /guitar|吉他/i.test(style) ? 24 : 4, volume: 82, pan: -8 },
      makeChords(bars, chords, style)
    ),
    instrumentTrack(
      input,
      'pad',
      { id: 'pad', type: 'instrument', name: 'Pad', role: 'pad', channel: 4, program: /strings|弦乐/i.test(style) ? 48 : 89, volume: 58, pan: 0 },
      makePad(bars, chords, style)
    ),
    instrumentTrack(
      input,
      'melody',
      { id: 'melody', type: 'instrument', name: 'Melody', role: 'melody', channel: 3, program: 80, volume: 86, pan: 8 },
      makeMelody(bars, chords, key, seed)
    )
  ]

  return {
    ...input,
    bpm,
    bars,
    tracks: arrangedTracks
  }
}

export function polishComposition(input: Composition, context: { idea?: string; style?: string } = {}): Composition {
  const bars = clamp(Math.round(input.bars), 4, 32)
  const maxBeats = bars * 4
  const seed = hashText(`${input.title}:${input.key}:${context.style ?? ''}:${context.idea ?? ''}`)
  const fallback = arrangeComposition(input, context)
  const fallbackByRole = new Map<CompositionTrack['role'], CompositionTrack>(
    fallback.tracks.map((track) => [track.role, track])
  )

  return {
    ...input,
    bpm: clamp(Math.round(input.bpm), 60, 160),
    bars,
    tracks: input.tracks.map((track) => {
      const fallbackTrack = fallbackByRole.get(track.role)
      const shouldReplaceSparseRequiredTrack =
        isRequiredRole(track.role) && fallbackTrack && track.notes.length < roleMinimumNotes(track.role, bars)
      const notes = shouldReplaceSparseRequiredTrack
        ? fallbackTrack.notes
        : humanizeNotes(track.notes, track.role, seed, maxBeats)

      return {
        ...track,
        notes
      } as CompositionTrack
    })
  }
}
