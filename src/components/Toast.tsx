import { useEffect } from 'react'
import { useFlowStore } from '../store/useFlowStore'

export function Toast() {
  const toast = useFlowStore((s) => s.toast)
  const dismissToast = useFlowStore((s) => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(dismissToast, 4000)
    return () => clearTimeout(id)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-md px-4 py-3 text-sm text-white shadow-card ${
        toast.tone === 'error' ? 'bg-urgent' : 'bg-brand'
      }`}
    >
      {toast.message}
    </div>
  )
}
