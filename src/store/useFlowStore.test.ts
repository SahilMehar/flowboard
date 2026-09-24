import { beforeEach, describe, expect, it } from 'vitest'
import { useFlowStore } from './useFlowStore'

describe('flow store mutations', () => {
  beforeEach(() => {
    useFlowStore.getState().resetSeed()
  })

  it('returns FORBIDDEN when Bob updates a Marketing task', () => {
    useFlowStore.getState().setCurrentUser('user-bob')
    const result = useFlowStore.getState().updateTask('task-13', { title: 'Hacked' })
    expect(result.error?.code).toBe('FORBIDDEN')
    expect(useFlowStore.getState().tasks['task-13'].title).toBe('Draft launch thread')
  })

  it('lets Alice update that same task', () => {
    const result = useFlowStore.getState().updateTask('task-13', { title: 'Draft launch thread v2' })
    expect(result.error).toBeUndefined()
    expect(useFlowStore.getState().tasks['task-13'].title).toBe('Draft launch thread v2')
  })
})
