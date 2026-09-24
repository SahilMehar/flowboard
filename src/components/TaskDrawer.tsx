import { useEffect, useRef } from 'react'
import type { Priority } from '../types'
import { canEditTasksInList, canViewContainer } from '../lib/permissions'
import { statusesForList } from '../store/selectors'
import { useFlowStore } from '../store/useFlowStore'

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

export function TaskDrawer() {
  const taskId = useFlowStore((s) => s.drawerTaskId)
  const task = useFlowStore((s) => (s.drawerTaskId ? s.tasks[s.drawerTaskId] : undefined))
  const userMap = useFlowStore((s) => s.users)
  const currentUser = useFlowStore((s) => s.users[s.currentUserId])
  const containers = useFlowStore((s) => s.containers)
  const grants = useFlowStore((s) => s.grants)
  const statusMap = useFlowStore((s) => s.statuses)
  const openTask = useFlowStore((s) => s.openTask)
  const updateTask = useFlowStore((s) => s.updateTask)
  const archiveTask = useFlowStore((s) => s.archiveTask)
  const closeBtn = useRef<HTMLButtonElement>(null)

  const users = Object.values(userMap)
  const lists = currentUser
    ? Object.values(containers).filter(
        (c) =>
          c.type === 'list' &&
          !c.archivedAt &&
          canViewContainer(containers, grants, currentUser, c.id),
      )
    : []
  const statuses = task ? statusesForList(statusMap, task.primaryListId) : []
  const canEdit =
    !!currentUser &&
    !!task &&
    canEditTasksInList(containers, grants, currentUser, task.primaryListId)

  useEffect(() => {
    if (!taskId) return
    closeBtn.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') openTask(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [taskId, openTask])

  if (!task) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close drawer overlay"
        className="flex-1 bg-ink/20"
        onClick={() => openTask(null)}
      />
      <aside className="flex h-full w-full max-w-md flex-col bg-panel shadow-card">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">Task</h2>
          <button
            ref={closeBtn}
            type="button"
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface hover:text-ink"
            onClick={() => openTask(null)}
          >
            Close
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          <label className="block text-xs font-medium text-muted">
            Title
            <input
              disabled={!canEdit}
              value={task.title}
              maxLength={500}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Description
            <textarea
              disabled={!canEdit}
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Status
            <select
              disabled={!canEdit}
              value={task.statusId}
              onChange={(e) => updateTask(task.id, { statusId: e.target.value })}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            List
            <select
              disabled={!canEdit}
              value={task.primaryListId}
              onChange={(e) => {
                const listId = e.target.value
                const first = Object.values(useFlowStore.getState().statuses)
                  .filter((s) => s.listId === listId)
                  .sort((a, b) => a.position - b.position)[0]
                if (first) updateTask(task.id, { primaryListId: listId, statusId: first.id })
              }}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Priority
            <select
              disabled={!canEdit}
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Due date
            <input
              disabled={!canEdit}
              type="date"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
              onChange={(e) =>
                updateTask(task.id, {
                  dueDate: e.target.value ? `${e.target.value}T18:00:00.000Z` : null,
                })
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </label>
          <fieldset className="text-xs font-medium text-muted">
            <legend>Assignees</legend>
            <div className="mt-2 space-y-1">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 font-normal text-ink">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={task.assigneeIds.includes(u.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...task.assigneeIds, u.id]
                        : task.assigneeIds.filter((id) => id !== u.id)
                      updateTask(task.id, { assigneeIds: next })
                    }}
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {canEdit && (
          <div className="border-t border-line p-4">
            <button
              type="button"
              className="text-sm text-urgent hover:underline"
              onClick={() => archiveTask(task.id)}
            >
              Archive task
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
