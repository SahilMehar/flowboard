let next = Date.now()

export function uid(prefix: string): string {
  next += 1
  return `${prefix}-${next}`
}

export function nowIso(): string {
  return new Date().toISOString()
}
