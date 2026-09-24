import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Container,
  ContainerType,
  Status,
  StoreError,
  StoreResult,
  Task,
  Toast,
  User,
  ViewMode,
  Visibility,
} from '../types'
import { createSeed } from '../seed'
import { nowIso, uid } from '../lib/ids'
import {
  canEditTasksInList,
  canMutateContainer,
  canViewContainer,
} from '../lib/permissions'
import { firstVisibleListId } from './selectors'

const CHILD_OF: Record<ContainerType, ContainerType | null> = {
  workspace: 'space',
  space: 'folder',
  folder: 'list',
  list: null,
}

const DEFAULT_STATUSES: { name: string; category: Status['category']; color: string }[] = [
  { name: 'Todo', category: 'todo', color: '#64748b' },
  { name: 'In progress', category: 'in_progress', color: '#0f766e' },
  { name: 'Done', category: 'done', color: '#059669' },
]

let loadTimer: ReturnType<typeof setTimeout> | undefined

function fail(code: StoreError['code'], message: string): StoreResult<never> {
  return { error: { code, message } }
}

type SeedSlice = ReturnType<typeof createSeed>

export type FlowState = SeedSlice & {
  drawerTaskId: string | null
  listLoading: boolean
  toast: Toast | null
  sortKey: 'dueDate' | 'priority'
  setCurrentUser: (userId: string) => void
  selectList: (listId: string) => StoreResult
  setViewMode: (mode: ViewMode) => void
  setSortKey: (key: 'dueDate' | 'priority') => void
  openTask: (taskId: string | null) => StoreResult
  dismissToast: () => void
  resetSeed: () => void
  toggleExpanded: (id: string) => void
  createContainer: (input: {
    parentId: string
    name: string
    type: ContainerType
    visibility?: Visibility
  }) => StoreResult<Container>
  renameContainer: (id: string, name: string) => StoreResult<Container>
  archiveContainer: (id: string) => StoreResult
  createTask: (input: { listId: string; title: string }) => StoreResult<Task>
  updateTask: (
    id: string,
    patch: Partial<
      Pick<
        Task,
        | 'title'
        | 'description'
        | 'statusId'
        | 'priority'
        | 'assigneeIds'
        | 'dueDate'
        | 'primaryListId'
      >
    >,
  ) => StoreResult<Task>
  archiveTask: (id: string) => StoreResult
  moveTask: (input: {
    taskId: string
    listId?: string
    statusId: string
    beforeTaskId?: string | null
  }) => StoreResult<Task>
}

function currentUser(state: FlowState): User | undefined {
  return state.users[state.currentUserId]
}

function toastError(message: string): Toast {
  return { id: uid('toast'), tone: 'error', message }
}

function nextPosition(
  items: { parentId: string | null; position: number; archivedAt: string | null }[],
  parentId: string,
): number {
  const siblings = items.filter((i) => i.parentId === parentId && !i.archivedAt)
  return siblings.reduce((max, s) => Math.max(max, s.position), -1) + 1
}

function applyMove(
  tasks: Record<string, Task>,
  task: Task,
  listId: string,
  statusId: string,
  beforeTaskId: string | null | undefined,
): Record<string, Task> {
  const column = Object.values(tasks)
    .filter(
      (t) =>
        t.id !== task.id &&
        !t.archivedAt &&
        t.primaryListId === listId &&
        t.statusId === statusId,
    )
    .sort((a, b) => a.position - b.position)

  let index = column.length
  if (beforeTaskId) {
    const found = column.findIndex((t) => t.id === beforeTaskId)
    if (found >= 0) index = found
  }
  const ordered = [
    ...column.slice(0, index),
    { ...task, primaryListId: listId, statusId, updatedAt: nowIso() },
    ...column.slice(index),
  ]

  const next = { ...tasks }
  ordered.forEach((t, position) => {
    next[t.id] = { ...t, primaryListId: listId, statusId, position, updatedAt: nowIso() }
  })
  return next
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      drawerTaskId: null,
      listLoading: false,
      toast: null,
      sortKey: 'dueDate',

      setCurrentUser: (userId) => {
        const state = get()
        const user = state.users[userId]
        if (!user) return
        const stillVisible =
          state.selectedListId &&
          canViewContainer(state.containers, state.grants, user, state.selectedListId)
        const selectedListId = stillVisible
          ? state.selectedListId
          : firstVisibleListId(state.containers, state.grants, user)
        set({
          currentUserId: userId,
          selectedListId,
          drawerTaskId: null,
        })
      },

      selectList: (listId) => {
        const state = get()
        const user = currentUser(state)
        if (!user) return fail('NOT_FOUND', 'No current user')
        if (!canViewContainer(state.containers, state.grants, user, listId)) {
          const message = 'You do not have access to this list'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        if (loadTimer) clearTimeout(loadTimer)
        set({ selectedListId: listId, listLoading: true, drawerTaskId: null })
        loadTimer = setTimeout(() => {
          set({ listLoading: false })
        }, 200)
        return { data: undefined }
      },

      setViewMode: (viewMode) => set({ viewMode }),
      setSortKey: (sortKey) => set({ sortKey }),

      openTask: (taskId) => {
        if (!taskId) {
          set({ drawerTaskId: null })
          return { data: undefined }
        }
        const state = get()
        const user = currentUser(state)
        const task = state.tasks[taskId]
        if (!user || !task) return fail('NOT_FOUND', 'Task not found')
        if (!canViewContainer(state.containers, state.grants, user, task.primaryListId)) {
          const message = 'You do not have access to this task'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        set({ drawerTaskId: taskId })
        return { data: undefined }
      },

      dismissToast: () => set({ toast: null }),

      resetSeed: () => {
        if (loadTimer) clearTimeout(loadTimer)
        set({
          ...createSeed(),
          drawerTaskId: null,
          listLoading: false,
          toast: null,
          sortKey: 'dueDate',
        })
      },

      toggleExpanded: (id) => {
        const expandedIds = { ...get().expandedIds }
        expandedIds[id] = !expandedIds[id]
        set({ expandedIds })
      },

      createContainer: ({ parentId, name, type, visibility = 'public' }) => {
        const state = get()
        const user = currentUser(state)
        if (!user) return fail('NOT_FOUND', 'No current user')
        if (!canMutateContainer(user)) {
          const message = 'Only admins can change the workspace tree'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        const parent = state.containers[parentId]
        if (!parent) return fail('NOT_FOUND', 'Parent not found')
        if (CHILD_OF[parent.type] !== type) {
          return fail('VALIDATION', `A ${parent.type} can only contain a ${CHILD_OF[parent.type]}`)
        }
        const trimmed = name.trim()
        if (!trimmed) return fail('VALIDATION', 'Name is required')

        const container: Container = {
          id: uid(type.slice(0, 3)),
          name: trimmed,
          type,
          parentId,
          position: nextPosition(Object.values(state.containers), parentId),
          visibility,
          archivedAt: null,
        }
        const statuses = { ...state.statuses }
        if (type === 'list') {
          DEFAULT_STATUSES.forEach((status, position) => {
            const id = uid('st')
            statuses[id] = {
              id,
              listId: container.id,
              name: status.name,
              category: status.category,
              color: status.color,
              position,
            }
          })
        }
        set({
          containers: { ...state.containers, [container.id]: container },
          statuses,
          expandedIds: { ...state.expandedIds, [parentId]: true, [container.id]: true },
        })
        return { data: container }
      },

      renameContainer: (id, name) => {
        const state = get()
        const user = currentUser(state)
        const container = state.containers[id]
        if (!user || !container) return fail('NOT_FOUND', 'Container not found')
        if (!canMutateContainer(user)) {
          const message = 'Only admins can rename containers'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        const trimmed = name.trim()
        if (!trimmed) return fail('VALIDATION', 'Name is required')
        const next = { ...container, name: trimmed }
        set({ containers: { ...state.containers, [id]: next } })
        return { data: next }
      },

      archiveContainer: (id) => {
        const state = get()
        const user = currentUser(state)
        const container = state.containers[id]
        if (!user || !container) return fail('NOT_FOUND', 'Container not found')
        if (container.type === 'workspace') return fail('VALIDATION', 'Cannot archive the workspace')
        if (!canMutateContainer(user)) {
          const message = 'Only admins can archive containers'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        const archivedAt = nowIso()
        const containers = { ...state.containers }
        const archiveRecursive = (cid: string) => {
          const node = containers[cid]
          if (!node) return
          containers[cid] = { ...node, archivedAt }
          Object.values(containers).forEach((child) => {
            if (child.parentId === cid) archiveRecursive(child.id)
          })
        }
        archiveRecursive(id)
        const selectedGone =
          state.selectedListId &&
          containers[state.selectedListId]?.archivedAt
        set({
          containers,
          selectedListId: selectedGone
            ? firstVisibleListId(containers, state.grants, user)
            : state.selectedListId,
        })
        return { data: undefined }
      },

      createTask: ({ listId, title }) => {
        const state = get()
        const user = currentUser(state)
        if (!user) return fail('NOT_FOUND', 'No current user')
        if (!canEditTasksInList(state.containers, state.grants, user, listId)) {
          const message = 'You cannot add tasks to this list'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        const trimmed = title.trim()
        if (!trimmed) return fail('VALIDATION', 'Title is required')
        if (trimmed.length > 500) return fail('VALIDATION', 'Title must be 500 characters or less')
        const firstStatus = Object.values(state.statuses)
          .filter((s) => s.listId === listId)
          .sort((a, b) => a.position - b.position)[0]
        if (!firstStatus) return fail('VALIDATION', 'This list has no statuses')
        const position = Object.values(state.tasks).filter(
          (t) => t.primaryListId === listId && t.statusId === firstStatus.id && !t.archivedAt,
        ).length
        const task: Task = {
          id: uid('task'),
          primaryListId: listId,
          title: trimmed,
          description: '',
          statusId: firstStatus.id,
          priority: 'normal',
          assigneeIds: [],
          dueDate: null,
          position,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          archivedAt: null,
          parentTaskId: null,
        }
        set({ tasks: { ...state.tasks, [task.id]: task }, drawerTaskId: task.id })
        return { data: task }
      },

      updateTask: (id, patch) => {
        const state = get()
        const user = currentUser(state)
        const task = state.tasks[id]
        if (!user || !task) return fail('NOT_FOUND', 'Task not found')
        const destList = patch.primaryListId ?? task.primaryListId
        if (
          !canEditTasksInList(state.containers, state.grants, user, task.primaryListId) ||
          !canEditTasksInList(state.containers, state.grants, user, destList)
        ) {
          const message = 'You cannot edit this task'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        if (patch.title !== undefined) {
          const trimmed = patch.title.trim()
          if (!trimmed) return fail('VALIDATION', 'Title is required')
          if (trimmed.length > 500) return fail('VALIDATION', 'Title must be 500 characters or less')
          patch = { ...patch, title: trimmed }
        }
        const statusId = patch.statusId ?? task.statusId
        const status = state.statuses[statusId]
        if (!status || status.listId !== destList) {
          return fail('VALIDATION', 'Status must belong to the task list')
        }
        const next: Task = {
          ...task,
          ...patch,
          statusId,
          primaryListId: destList,
          updatedAt: nowIso(),
        }
        set({ tasks: { ...state.tasks, [id]: next } })
        return { data: next }
      },

      archiveTask: (id) => {
        const state = get()
        const user = currentUser(state)
        const task = state.tasks[id]
        if (!user || !task) return fail('NOT_FOUND', 'Task not found')
        if (!canEditTasksInList(state.containers, state.grants, user, task.primaryListId)) {
          const message = 'You cannot delete this task'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        set({
          tasks: {
            ...state.tasks,
            [id]: { ...task, archivedAt: nowIso(), updatedAt: nowIso() },
          },
          drawerTaskId: state.drawerTaskId === id ? null : state.drawerTaskId,
        })
        return { data: undefined }
      },

      moveTask: ({ taskId, listId, statusId, beforeTaskId }) => {
        const state = get()
        const user = currentUser(state)
        const task = state.tasks[taskId]
        if (!user || !task) return fail('NOT_FOUND', 'Task not found')
        const destList = listId ?? task.primaryListId
        if (
          !canEditTasksInList(state.containers, state.grants, user, task.primaryListId) ||
          !canEditTasksInList(state.containers, state.grants, user, destList)
        ) {
          const message = 'You cannot move this task'
          set({ toast: toastError(message) })
          return fail('FORBIDDEN', message)
        }
        const status = state.statuses[statusId]
        if (!status || status.listId !== destList) {
          return fail('VALIDATION', 'Status must belong to the destination list')
        }
        set({ tasks: applyMove(state.tasks, task, destList, statusId, beforeTaskId) })
        const moved = get().tasks[taskId]
        if (!moved) return fail('NOT_FOUND', 'Task not found')
        return { data: moved }
      },
    }),
    {
      name: 'flowboard-store',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        selectedListId: state.selectedListId,
        viewMode: state.viewMode,
        sortKey: state.sortKey,
        containers: state.containers,
        statuses: state.statuses,
        tasks: state.tasks,
        users: state.users,
        grants: state.grants,
        expandedIds: state.expandedIds,
      }),
    },
  ),
)
