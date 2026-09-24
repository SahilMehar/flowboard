import type { Priority } from '../types'
import { PRIORITY_CLASS } from '../lib/format'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_CLASS[priority]}`}
    >
      {priority}
    </span>
  )
}
