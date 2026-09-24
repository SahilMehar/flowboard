export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 p-4" aria-busy="true">
      {[0, 1, 2].map((col) => (
        <div key={col} className="w-72 shrink-0 rounded-md bg-panel p-3 shadow-card">
          <div className="mb-3 h-4 w-24 rounded bg-line" />
          <div className="space-y-2">
            <div className="h-20 rounded-md bg-surface" />
            <div className="h-20 rounded-md bg-surface" />
            <div className="h-16 rounded-md bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TreeSkeleton() {
  return (
    <div className="space-y-2 p-3">
      <div className="h-4 w-28 rounded bg-line" />
      <div className="ml-3 h-4 w-24 rounded bg-line" />
      <div className="ml-6 h-4 w-20 rounded bg-line" />
    </div>
  )
}
