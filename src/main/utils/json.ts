export function parseJson<T>(value: string): T {
  return JSON.parse(value) as T
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}
