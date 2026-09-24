import { useState, type KeyboardEvent } from 'react'
import type { ContainerType } from '../types'
import { canMutateContainer } from '../lib/permissions'
import { visibleTree, type TreeNode } from '../store/selectors'
import { useFlowStore } from '../store/useFlowStore'
import { TreeSkeleton } from './Skeleton'

const ADD_CHILD: Partial<Record<ContainerType, ContainerType>> = {
  workspace: 'space',
  space: 'folder',
  folder: 'list',
}

function NodeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const { container, children } = node
  const selectedListId = useFlowStore((s) => s.selectedListId)
  const expanded = useFlowStore((s) => s.expandedIds[container.id] !== false)
  const user = useFlowStore((s) => s.users[s.currentUserId])
  const toggleExpanded = useFlowStore((s) => s.toggleExpanded)
  const selectList = useFlowStore((s) => s.selectList)
  const createContainer = useFlowStore((s) => s.createContainer)
  const renameContainer = useFlowStore((s) => s.renameContainer)
  const archiveContainer = useFlowStore((s) => s.archiveContainer)
  const [renaming, setRenaming] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(container.name)
  const isAdmin = user ? canMutateContainer(user) : false
  const selected = container.type === 'list' && container.id === selectedListId
  const childType = ADD_CHILD[container.type]

  function commitRename() {
    renameContainer(container.id, draft)
    setRenaming(false)
  }

  function commitAdd() {
    if (!childType || !draft.trim()) {
      setAdding(false)
      setDraft(container.name)
      return
    }
    createContainer({ parentId: container.id, name: draft, type: childType })
    setAdding(false)
    setDraft(container.name)
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>, kind: 'rename' | 'add') {
    if (e.key === 'Enter') kind === 'rename' ? commitRename() : commitAdd()
    if (e.key === 'Escape') {
      setRenaming(false)
      setAdding(false)
      setDraft(container.name)
    }
  }

  const pad = ['pl-2', 'pl-5', 'pl-8', 'pl-11', 'pl-14'][Math.min(depth, 4)]

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md pr-1 text-sm ${pad} ${
          selected ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-surface'
        }`}
      >
        {children.length > 0 || container.type !== 'list' ? (
          <button
            type="button"
            className="h-6 w-6 shrink-0 text-muted hover:text-ink"
            onClick={() => toggleExpanded(container.id)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-6" />
        )}
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => onKey(e, 'rename')}
            className="min-w-0 flex-1 rounded border border-brand px-1 py-0.5 text-sm"
          />
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate py-1 text-left font-medium"
            onClick={() => {
              if (container.type === 'list') selectList(container.id)
              else toggleExpanded(container.id)
            }}
          >
            {container.name}
            {container.visibility === 'private' && (
              <span className="ml-1 text-[10px] font-normal text-muted">private</span>
            )}
          </button>
        )}
        {isAdmin && !renaming && (
          <span className="hidden shrink-0 group-hover:flex">
            {childType && (
              <button
                type="button"
                className="px-1 text-xs text-muted hover:text-ink"
                onClick={() => {
                  setAdding(true)
                  setDraft('')
                }}
              >
                +
              </button>
            )}
            {container.type !== 'workspace' && (
              <>
                <button
                  type="button"
                  className="px-1 text-xs text-muted hover:text-ink"
                  onClick={() => {
                    setRenaming(true)
                    setDraft(container.name)
                  }}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="px-1 text-xs text-muted hover:text-urgent"
                  onClick={() => archiveContainer(container.id)}
                >
                  ⌫
                </button>
              </>
            )}
          </span>
        )}
      </div>
      {adding && childType && (
        <input
          autoFocus
          placeholder={`New ${childType}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitAdd}
          onKeyDown={(e) => onKey(e, 'add')}
          className="ml-10 mt-1 w-[calc(100%-2.5rem)] rounded border border-brand px-2 py-1 text-sm"
        />
      )}
      {expanded &&
        children.map((child) => <NodeRow key={child.container.id} node={child} depth={depth + 1} />)}
    </div>
  )
}

export function Sidebar() {
  const containers = useFlowStore((s) => s.containers)
  const grants = useFlowStore((s) => s.grants)
  const user = useFlowStore((s) => s.users[s.currentUserId])
  const tree = user ? visibleTree(containers, grants, user) : []

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-panel">
      <div className="flex h-14 items-center px-4">
        <span className="text-sm font-bold tracking-tight text-brand">Flowboard</span>
      </div>
      <nav className="flex-1 overflow-auto px-2 pb-4" aria-label="Workspace tree">
        {tree.length === 0 ? <TreeSkeleton /> : tree.map((node) => <NodeRow key={node.container.id} node={node} depth={0} />)}
      </nav>
    </aside>
  )
}

