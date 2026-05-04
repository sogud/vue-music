import type { Composition } from '@shared/types'
import { ZodError } from 'zod'
import { CompositionSchema } from '../pi/pi-schemas'

export { CompositionSchema }

export function validateComposition(composition: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  const parsed = CompositionSchema.safeParse(composition)

  if (!parsed.success) {
    errors.push(...formatZodErrors(parsed.error))
    return { ok: false, errors }
  }

  errors.push(...validateBusinessRules(parsed.data))
  return { ok: errors.length === 0, errors }
}

export function assertValidComposition(composition: unknown): asserts composition is Composition {
  const result = validateComposition(composition)
  if (!result.ok) {
    throw new Error(`Composition 校验失败：${result.errors.join('; ')}`)
  }
}

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => `${issue.path.join('.') || 'composition'}: ${issue.message}`)
}

function validateBusinessRules(composition: Composition) {
  const errors: string[] = []
  const roles = new Set(composition.tracks.map((track) => track.role))
  for (const role of ['drums', 'bass', 'chords', 'melody']) {
    if (!roles.has(role as never)) errors.push(`缺少必要轨道：${role}`)
  }

  const trackIds = new Set<string>()
  let totalNotes = 0
  const maxBeats = composition.bars * 4

  for (const track of composition.tracks) {
    if (trackIds.has(track.id)) errors.push(`track id 重复：${track.id}`)
    trackIds.add(track.id)
    if (track.notes.length > 512) errors.push(`${track.name} notes 超过 512`)
    totalNotes += track.notes.length

    for (const note of track.notes) {
      if (note.start < 0) errors.push(`${track.name} note.start 不能小于 0`)
      if (note.start + note.duration > maxBeats) {
        errors.push(`${track.name} note 超出总长度：${note.start} + ${note.duration} > ${maxBeats}`)
      }
    }
  }

  if (totalNotes > 2000) errors.push('总 note 数超过 2000')
  return errors
}
