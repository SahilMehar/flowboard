import { useFlowStore } from '../store/useFlowStore'
import { Avatar } from './Avatar'

export function UserSwitcher() {
  const users = useFlowStore((s) => s.users)
  const currentUserId = useFlowStore((s) => s.currentUserId)
  const setCurrentUser = useFlowStore((s) => s.setCurrentUser)
  const current = users[currentUserId]
  const userList = Object.values(users)

  return (
    <label className="flex items-center gap-2 rounded-md border border-line bg-panel px-2 py-1 text-sm">
      {current && <Avatar user={current} />}
      <span className="text-xs font-medium text-muted">Acting as</span>
      <select
        aria-label="Switch user"
        className="bg-transparent font-semibold text-ink focus:outline-none"
        value={currentUserId}
        onChange={(e) => setCurrentUser(e.target.value)}
      >
        {userList.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </label>
  )
}
