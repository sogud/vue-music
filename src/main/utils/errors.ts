export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export function summarizeStderr(stderr: string) {
  const trimmed = stderr.trim()
  if (!trimmed) return ''
  return trimmed.length > 800 ? `${trimmed.slice(0, 800)}...` : trimmed
}
