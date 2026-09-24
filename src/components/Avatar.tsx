import type { User } from '../types'

const AVATAR_BG: Record<string, string> = {
  'user-alice': 'bg-brand',
  'user-bob': 'bg-normal',
  'user-carol': 'bg-high',
}

export function Avatar({ user, size = 'sm' }: { user: User; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-7 w-7 text-[11px]' : 'h-6 w-6 text-[10px]'
  const bg = AVATAR_BG[user.id] ?? 'bg-muted'
  return (
    <span
      title={user.name}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${dim} ${bg}`}
    >
      {user.initials}
    </span>
  )
}
