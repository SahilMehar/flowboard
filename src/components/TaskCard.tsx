import type { Task, User } from '../types'
import { formatDue, isOverdue } from '../lib/format'
import { Avatar } from './Avatar'
import { PriorityBadge } from './PriorityBadge'

export function TaskCard({
  task,
  users,
  onOpen,
}: {
  task: Task
  users: Record<string, User>
  onOpen?: (id: string) => void
}) {
  const assignees = task.assigneeIds.map((id) => users[id]).filter(Boolean)
  const overdue = isOverdue(task.dueDate)

  return (
    <button
      type="button"
      onClick={() => onOpen?.(task.id)}
      className="w-full rounded-md border border-line bg-panel p-3 text-left shadow-card transition hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
    >
      <p className="text-sm font-medium text-ink">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`text-[11px] ${overdue ? 'font-semibold text-urgent' : 'text-muted'}`}>
            {formatDue(task.dueDate)}
          </span>
        )}
        <span className="ml-auto flex -space-x-1">
          {assignees.map((user) => (
            <Avatar key={user.id} user={user} />
          ))}
        </span>
      </div>
    </button>
  )
}
