import { PRIORITY_RANK, formatDue, isOverdue } from '../lib/format'
import { tasksForList } from '../store/selectors'
import { useFlowStore } from '../store/useFlowStore'
import { Avatar } from './Avatar'
import { PriorityBadge } from './PriorityBadge'

export function ListView() {
  const listId = useFlowStore((s) => s.selectedListId)
  const sortKey = useFlowStore((s) => s.sortKey)
  const setSortKey = useFlowStore((s) => s.setSortKey)
  const statuses = useFlowStore((s) => s.statuses)
  const users = useFlowStore((s) => s.users)
  const taskMap = useFlowStore((s) => s.tasks)
  const openTask = useFlowStore((s) => s.openTask)
  const tasks = listId ? tasksForList(taskMap, listId) : []

  const sorted = [...tasks].sort((a, b) => {
    if (sortKey === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
    return ad - bd
  })

  if (!listId) return null

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-muted">
        No tasks in this list. Add one from the top bar.
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-3 flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setSortKey('dueDate')}
          className={`rounded-md px-2 py-1 ${sortKey === 'dueDate' ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`}
        >
          Sort by due date
        </button>
        <button
          type="button"
          onClick={() => setSortKey('priority')}
          className={`rounded-md px-2 py-1 ${sortKey === 'priority' ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`}
        >
          Sort by priority
        </button>
      </div>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Assignees</th>
            <th className="px-3 py-2 font-medium">Priority</th>
            <th className="px-3 py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const status = statuses[task.statusId]
            const assignees = task.assigneeIds.map((id) => users[id]).filter(Boolean)
            return (
              <tr
                key={task.id}
                className="cursor-pointer border-b border-line hover:bg-brand-soft/50"
                onClick={() => openTask(task.id)}
              >
                <td className="px-3 py-2 font-medium text-ink">{task.title}</td>
                <td className="px-3 py-2 text-ink-soft">{status?.name}</td>
                <td className="px-3 py-2">
                  <span className="flex -space-x-1">
                    {assignees.map((u) => (
                      <Avatar key={u.id} user={u} />
                    ))}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className={`px-3 py-2 ${isOverdue(task.dueDate) ? 'font-semibold text-urgent' : 'text-muted'}`}>
                  {formatDue(task.dueDate)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
