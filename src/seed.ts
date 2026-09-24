import type {
  Container,
  Grant,
  Status,
  Task,
  User,
  ViewMode,
} from './types'

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

const users: User[] = [
  {
    id: 'user-alice',
    name: 'Alice',
    email: 'alice@yopmail.com',
    role: 'admin',
    initials: 'AL',
    color: '#0f766e',
  },
  {
    id: 'user-bob',
    name: 'Bob',
    email: 'bob@yopmail.com',
    role: 'member',
    initials: 'BO',
    color: '#0369a1',
  },
  {
    id: 'user-carol',
    name: 'Carol',
    email: 'carol@yopmail.com',
    role: 'member',
    initials: 'CA',
    color: '#c2410c',
  },
]

const containers: Container[] = [
  {
    id: 'ws-acme',
    name: 'Acme',
    type: 'workspace',
    parentId: null,
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
  {
    id: 'sp-eng',
    name: 'Engineering',
    type: 'space',
    parentId: 'ws-acme',
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
  {
    id: 'sp-mkt',
    name: 'Marketing',
    type: 'space',
    parentId: 'ws-acme',
    position: 1,
    visibility: 'private',
    archivedAt: null,
  },
  {
    id: 'fol-q2',
    name: 'Q2 Launch',
    type: 'folder',
    parentId: 'sp-eng',
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
  {
    id: 'fol-camp',
    name: 'Campaigns',
    type: 'folder',
    parentId: 'sp-mkt',
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
  {
    id: 'lst-backlog',
    name: 'Backlog',
    type: 'list',
    parentId: 'fol-q2',
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
  {
    id: 'lst-sprint',
    name: 'Sprint',
    type: 'list',
    parentId: 'fol-q2',
    position: 1,
    visibility: 'private',
    archivedAt: null,
  },
  {
    id: 'lst-social',
    name: 'Social',
    type: 'list',
    parentId: 'fol-camp',
    position: 0,
    visibility: 'public',
    archivedAt: null,
  },
]

const statuses: Status[] = [
  { id: 'st-bl-todo', listId: 'lst-backlog', name: 'Todo', category: 'todo', color: '#64748b', position: 0 },
  { id: 'st-bl-ip', listId: 'lst-backlog', name: 'In progress', category: 'in_progress', color: '#0f766e', position: 1 },
  { id: 'st-bl-done', listId: 'lst-backlog', name: 'Done', category: 'done', color: '#059669', position: 2 },
  { id: 'st-sp-todo', listId: 'lst-sprint', name: 'Todo', category: 'todo', color: '#64748b', position: 0 },
  { id: 'st-sp-ip', listId: 'lst-sprint', name: 'In progress', category: 'in_progress', color: '#0f766e', position: 1 },
  { id: 'st-sp-done', listId: 'lst-sprint', name: 'Done', category: 'done', color: '#059669', position: 2 },
  { id: 'st-so-todo', listId: 'lst-social', name: 'Todo', category: 'todo', color: '#64748b', position: 0 },
  { id: 'st-so-ip', listId: 'lst-social', name: 'In progress', category: 'in_progress', color: '#0f766e', position: 1 },
  { id: 'st-so-done', listId: 'lst-social', name: 'Done', category: 'done', color: '#059669', position: 2 },
]

function makeTask(
  id: string,
  listId: string,
  statusId: string,
  title: string,
  extras: Partial<Task> = {},
): Task {
  return {
    id,
    primaryListId: listId,
    title,
    description: extras.description ?? '',
    statusId,
    priority: extras.priority ?? 'normal',
    assigneeIds: extras.assigneeIds ?? [],
    dueDate: extras.dueDate ?? null,
    position: extras.position ?? 0,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
    archivedAt: null,
    parentTaskId: null,
  }
}

const tasks: Task[] = [
  makeTask('task-01', 'lst-backlog', 'st-bl-todo', 'Define auth error states', {
    priority: 'high',
    assigneeIds: ['user-bob'],
    dueDate: '2026-09-24T18:00:00.000Z',
    position: 0,
    description: 'Cover 401, 403, and timeout on the login form.',
  }),
  makeTask('task-02', 'lst-backlog', 'st-bl-todo', 'Paginate contacts table', {
    priority: 'urgent',
    assigneeIds: ['user-alice'],
    dueDate: '2026-09-20T18:00:00.000Z',
    position: 1,
  }),
  makeTask('task-03', 'lst-backlog', 'st-bl-ip', 'Virtualize board columns', {
    priority: 'high',
    assigneeIds: ['user-bob', 'user-alice'],
    dueDate: '2026-09-28T18:00:00.000Z',
    position: 0,
  }),
  makeTask('task-04', 'lst-backlog', 'st-bl-ip', 'Add empty column copy', {
    priority: 'low',
    assigneeIds: ['user-carol'],
    position: 1,
  }),
  makeTask('task-05', 'lst-backlog', 'st-bl-done', 'Seed fixture users', {
    priority: 'none',
    assigneeIds: ['user-alice'],
    dueDate: '2026-09-10T18:00:00.000Z',
    position: 0,
  }),
  makeTask('task-06', 'lst-backlog', 'st-bl-done', 'Choose Tailwind tokens', {
    priority: 'normal',
    assigneeIds: ['user-alice'],
    position: 1,
  }),
  makeTask('task-07', 'lst-sprint', 'st-sp-todo', 'Optimistic drag rollback', {
    priority: 'high',
    assigneeIds: ['user-bob'],
    dueDate: '2026-09-26T18:00:00.000Z',
    position: 0,
    description: 'Snapshot column order; restore if the store returns FORBIDDEN.',
  }),
  makeTask('task-08', 'lst-sprint', 'st-sp-todo', 'Keyboard move-to menu', {
    priority: 'normal',
    assigneeIds: ['user-bob'],
    position: 1,
  }),
  makeTask('task-09', 'lst-sprint', 'st-sp-ip', 'Permission selector tests', {
    priority: 'urgent',
    assigneeIds: ['user-alice', 'user-bob'],
    dueDate: '2026-09-22T18:00:00.000Z',
    position: 0,
  }),
  makeTask('task-10', 'lst-sprint', 'st-sp-ip', 'Toast on 403', {
    priority: 'high',
    assigneeIds: ['user-bob'],
    position: 1,
  }),
  makeTask('task-11', 'lst-sprint', 'st-sp-done', 'Status set per list', {
    priority: 'normal',
    assigneeIds: ['user-alice'],
    position: 0,
  }),
  makeTask('task-12', 'lst-sprint', 'st-sp-done', 'Soft-delete containers', {
    priority: 'low',
    assigneeIds: ['user-alice'],
    position: 1,
  }),
  makeTask('task-13', 'lst-social', 'st-so-todo', 'Draft launch thread', {
    priority: 'high',
    assigneeIds: ['user-carol'],
    dueDate: '2026-09-25T18:00:00.000Z',
    position: 0,
  }),
  makeTask('task-14', 'lst-social', 'st-so-todo', 'Resize creative assets', {
    priority: 'normal',
    assigneeIds: ['user-carol'],
    position: 1,
  }),
  makeTask('task-15', 'lst-social', 'st-so-ip', 'Schedule LinkedIn post', {
    priority: 'urgent',
    assigneeIds: ['user-carol', 'user-alice'],
    dueDate: '2026-09-21T18:00:00.000Z',
    position: 0,
  }),
  makeTask('task-16', 'lst-social', 'st-so-done', 'Brand color checklist', {
    priority: 'none',
    assigneeIds: ['user-carol'],
    position: 0,
  }),
  makeTask('task-17', 'lst-social', 'st-so-done', 'Update social bios', {
    priority: 'low',
    assigneeIds: ['user-carol'],
    position: 1,
  }),
]

const grants: Grant[] = [
  { id: 'grant-bob-sprint', resourceId: 'lst-sprint', userId: 'user-bob', mode: 'allow' },
  { id: 'grant-carol-mkt', resourceId: 'sp-mkt', userId: 'user-carol', mode: 'allow' },
  { id: 'grant-bob-deny-social', resourceId: 'lst-social', userId: 'user-bob', mode: 'deny' },
]

export const SEED_LIST_IDS = {
  backlog: 'lst-backlog',
  sprint: 'lst-sprint',
  social: 'lst-social',
} as const

export function createSeed() {
  return {
    currentUserId: 'user-alice',
    selectedListId: 'lst-backlog' as string | null,
    viewMode: 'kanban' as ViewMode,
    containers: indexById(containers),
    statuses: indexById(statuses),
    tasks: indexById(tasks),
    users: indexById(users),
    grants: [...grants],
    expandedIds: {
      'ws-acme': true,
      'sp-eng': true,
      'sp-mkt': true,
      'fol-q2': true,
      'fol-camp': true,
    } as Record<string, boolean>,
  }
}
