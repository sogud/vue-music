import { writeFile } from 'node:fs/promises'
import { Midi } from '@tonejs/midi'
import type { Composition } from '@shared/types'
import { assertValidComposition } from '../composition/composition-validator'

export class MidiService {
  async writeMidi(composition: Composition, midiPath: string) {
    assertValidComposition(composition)
    const midi = new Midi()
    midi.header.setTempo(composition.bpm)

    for (const compositionTrack of composition.tracks) {
      const midiTrack = midi.addTrack()
      midiTrack.name = compositionTrack.name
      ;(midiTrack as unknown as { channel: number }).channel = compositionTrack.channel

      if (compositionTrack.type === 'instrument') {
        midiTrack.instrument.number = compositionTrack.program
      }

      for (const note of compositionTrack.notes) {
        midiTrack.addNote({
          midi: note.pitch,
          time: this.beatsToSeconds(note.start, composition.bpm),
          duration: this.beatsToSeconds(note.duration, composition.bpm),
          velocity: note.velocity / 127
        })
      }
    }

    await writeFile(midiPath, Buffer.from(midi.toArray()))
    return midiPath
  }

  private beatsToSeconds(beats: number, bpm: number) {
    return beats * (60 / bpm)
  }
}

export const midiService = new MidiService()
