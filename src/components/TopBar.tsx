import { useState, type FormEvent } from 'react'
import { useFlowStore } from '../store/useFlowStore'
import { UserSwitcher } from './UserSwitcher'

export function TopBar() {
  const selectedListId = useFlowStore((s) => s.selectedListId)
  const listName = useFlowStore((s) =>
    s.selectedListId ? s.containers[s.selectedListId]?.name : 'No list',
  )
  const viewMode = useFlowStore((s) => s.viewMode)
  const setViewMode = useFlowStore((s) => s.setViewMode)
  const createTask = useFlowStore((s) => s.createTask)
  const resetSeed = useFlowStore((s) => s.resetSeed)
  const [title, setTitle] = useState('')

  function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!selectedListId || !title.trim()) return
    createTask({ listId: selectedListId, title })
    setTitle('')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{listName ?? 'Select a list'}</p>
      </div>
      <form onSubmit={onCreate} className="hidden items-center gap-2 md:flex">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={500}
          placeholder="New task"
          className="w-52 rounded-md border border-line px-3 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Add
        </button>
      </form>
      <div className="flex rounded-md border border-line p-0.5 text-sm">
        <button
          type="button"
          className={`rounded px-3 py-1 ${viewMode === 'kanban' ? 'bg-brand-soft font-medium text-brand' : 'text-muted hover:text-ink'}`}
          onClick={() => setViewMode('kanban')}
        >
          Board
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1 ${viewMode === 'list' ? 'bg-brand-soft font-medium text-brand' : 'text-muted hover:text-ink'}`}
          onClick={() => setViewMode('list')}
        >
          List
        </button>
      </div>
      <button
        type="button"
        onClick={resetSeed}
        className="hidden text-xs text-muted hover:text-ink lg:inline"
      >
        Reset seed
      </button>
      <UserSwitcher />
    </header>
  )
}
