export type ContainerType = 'workspace' | 'space' | 'folder' | 'list'
export type Visibility = 'public' | 'private'
export type UserRole = 'admin' | 'member'
export type Priority = 'urgent' | 'high' | 'normal' | 'low' | 'none'
export type StatusCategory = 'todo' | 'in_progress' | 'done'
export type GrantMode = 'allow' | 'deny'
export type ViewMode = 'kanban' | 'list'

export type Container = {
  id: string
  name: string
  type: ContainerType
  parentId: string | null
  position: number
  visibility: Visibility
  archivedAt: string | null
}

export type Status = {
  id: string
  listId: string
  name: string
  category: StatusCategory
  color: string
  position: number
}

export type Task = {
  id: string
  primaryListId: string
  title: string
  description: string
  statusId: string
  priority: Priority
  assigneeIds: string[]
  dueDate: string | null
  position: number
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  parentTaskId: string | null
}

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
  color: string
}

export type Grant = {
  id: string
  resourceId: string
  userId: string
  mode: GrantMode
}

export type StoreError = {
  code: 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT'
  message: string
}

export type StoreResult<T = void> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: StoreError }

export type Toast = {
  id: string
  tone: 'error' | 'success'
  message: string
}
