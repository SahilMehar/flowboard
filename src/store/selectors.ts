import type { Container, Grant, Status, Task, User } from '../types'
import { canViewContainer } from '../lib/permissions'

export type TreeNode = {
  container: Container
  children: TreeNode[]
}

function liveContainers(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
): Container[] {
  return Object.values(containers)
    .filter((c) => !c.archivedAt && canViewContainer(containers, grants, user, c.id))
    .sort((a, b) => a.position - b.position)
}

function childrenOf(nodes: Container[], parentId: string | null): TreeNode[] {
  return nodes
    .filter((c) => c.parentId === parentId)
    .map((container) => ({
      container,
      children: childrenOf(nodes, container.id),
    }))
}

export function visibleTree(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
): TreeNode[] {
  return childrenOf(liveContainers(containers, grants, user), null)
}

export function firstVisibleListId(
  containers: Record<string, Container>,
  grants: Grant[],
  user: User,
): string | null {
  const lists = liveContainers(containers, grants, user).filter((c) => c.type === 'list')
  return lists[0]?.id ?? null
}

export function statusesForList(
  statuses: Record<string, Status>,
  listId: string,
): Status[] {
  return Object.values(statuses)
    .filter((s) => s.listId === listId)
    .sort((a, b) => a.position - b.position)
}

export function tasksForList(
  tasks: Record<string, Task>,
  listId: string,
): Task[] {
  return Object.values(tasks)
    .filter((t) => t.primaryListId === listId && !t.archivedAt)
    .sort((a, b) => a.position - b.position)
}
