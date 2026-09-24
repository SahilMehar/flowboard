import type { Container, Grant, Task, User } from '../types'


export function ancestorsOf(
  containers: Record<string, Container>,
  id: string,
): Container[] {
  const chain: Container[] = []
  let current = containers[id]
  while (current) {
    chain.push(current)
    if (!current.parentId) break
    current = containers[current.parentId]
  }
  return chain
}

export function grantFor(
  grants: Grant[],
  userId: string,
  resourceId: string,
): Grant | undefined {
  return grants.find((g) => g.userId === userId && g.resourceId === resourceId)
}

export function canViewContainer(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
  containerId: string,
): boolean {
  if (user.role === 'admin') return true
  const chain = ancestorsOf(containers, containerId)
  if (chain.length === 0) return false

  for (const node of chain) {
    if (node.archivedAt) return false
    const grant = grantFor(grants, user.id, node.id)
    if (grant?.mode === 'deny') return false
    if (node.visibility === 'private' && grant?.mode !== 'allow') return false
  }
  return true
}

export function canEditTasksInList(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
  listId: string,
): boolean {
  const list = containers[listId]
  if (!list || list.type !== 'list') return false
  return canViewContainer(containers, grants, user, listId)
}

export function canMutateContainer(user: User): boolean {
  return user.role === 'admin'
}

export function canViewTask(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
  task: Task,
): boolean {
  return canViewContainer(containers, grants, user, task.primaryListId)
}
