import { describe, expect, it } from 'vitest'
import { canViewContainer, canEditTasksInList } from './permissions'
import { createSeed } from '../seed'

describe('permissions', () => {
  const seed = createSeed()
  const alice = seed.users['user-alice']
  const bob = seed.users['user-bob']
  const carol = seed.users['user-carol']

  it('lets Alice see every space and list', () => {
    expect(canViewContainer(seed.containers, seed.grants, alice, 'sp-mkt')).toBe(true)
    expect(canViewContainer(seed.containers, seed.grants, alice, 'lst-social')).toBe(true)
    expect(canViewContainer(seed.containers, seed.grants, alice, 'lst-sprint')).toBe(true)
  })

  it('hides Marketing from Bob (private space, no allow)', () => {
    expect(canViewContainer(seed.containers, seed.grants, bob, 'sp-mkt')).toBe(false)
    expect(canViewContainer(seed.containers, seed.grants, bob, 'lst-social')).toBe(false)
  })

  it('lets Bob see public Backlog and private Sprint (allow grant)', () => {
    expect(canViewContainer(seed.containers, seed.grants, bob, 'lst-backlog')).toBe(true)
    expect(canViewContainer(seed.containers, seed.grants, bob, 'lst-sprint')).toBe(true)
    expect(canEditTasksInList(seed.containers, seed.grants, bob, 'lst-sprint')).toBe(true)
  })

  it('lets Carol see Marketing because of an allow grant on the space', () => {
    expect(canViewContainer(seed.containers, seed.grants, carol, 'sp-mkt')).toBe(true)
    expect(canViewContainer(seed.containers, seed.grants, carol, 'lst-social')).toBe(true)
    expect(canViewContainer(seed.containers, seed.grants, carol, 'lst-sprint')).toBe(false)
  })

  it('hides a public container when the user has a deny grant', () => {
    const grants = [
      ...seed.grants,
      { id: 'deny-backlog', resourceId: 'lst-backlog', userId: 'user-bob', mode: 'deny' as const },
    ]
    expect(canViewContainer(seed.containers, grants, bob, 'lst-backlog')).toBe(false)
  })
})
