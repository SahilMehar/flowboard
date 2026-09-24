import { canViewContainer } from '../lib/permissions'
import { useFlowStore } from '../store/useFlowStore'
import { KanbanBoard } from './KanbanBoard'
import { ListView } from './ListView'
import { Sidebar } from './Sidebar'
import { BoardSkeleton } from './Skeleton'
import { TaskDrawer } from './TaskDrawer'
import { Toast } from './Toast'
import { TopBar } from './TopBar'

export function AppShell() {
  const listLoading = useFlowStore((s) => s.listLoading)
  const viewMode = useFlowStore((s) => s.viewMode)
  const selectedListId = useFlowStore((s) => s.selectedListId)
  const allowed = useFlowStore((s) => {
    const user = s.users[s.currentUserId]
    if (!user || !s.selectedListId) return false
    return canViewContainer(s.containers, s.grants, user, s.selectedListId)
  })

  return (
    <div className="flex h-full bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden">
          {listLoading ? (
            <BoardSkeleton />
          ) : !selectedListId ? (
            <p className="p-8 text-sm text-muted">Select a list in the sidebar.</p>
          ) : !allowed ? (
            <div className="m-4 rounded-md border border-urgent/30 bg-urgent/10 px-4 py-3 text-sm text-urgent">
              You do not have access to this list (403).
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard />
          ) : (
            <ListView />
          )}
        </main>
      </div>
      <TaskDrawer />
      <Toast />
    </div>
  )
}
