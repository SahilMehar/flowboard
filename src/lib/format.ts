import type { Priority } from '../types'

export const PRIORITY_CLASS: Record<Priority, string> = {
  urgent: 'bg-urgent/15 text-urgent',
  high: 'bg-high/15 text-high',
  normal: 'bg-normal/15 text-normal',
  low: 'bg-low/15 text-low',
  none: 'bg-none/20 text-muted',
}

export const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
  none: 4,
}

export function formatDue(iso: string | null): string {
  if (!iso) return 'No date'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}
