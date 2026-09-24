import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Status, Task } from '../types'
import { tasksForList } from '../store/selectors'
import { useFlowStore } from '../store/useFlowStore'
import { TaskCard } from './TaskCard'

function columnId(statusId: string) {
  return `column:${statusId}`
}

function SortableCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const users = useFlowStore((s) => s.users)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? 'opacity-40' : undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} users={users} onOpen={onOpen} />
    </div>
  )
}

function Column({
  status,
  tasks,
  onOpen,
}: {
  status: Status
  tasks: Task[]
  onOpen: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId(status.id) })

  return (
    <section
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-md bg-surface/80 p-3 ${
        isOver ? 'ring-2 ring-brand' : ''
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{status.name}</h2>
        <span className="text-xs text-muted">{tasks.length}</span>
      </header>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-24 flex-1 flex-col gap-2">
          {tasks.length === 0 && (
            <p className="rounded-md border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
              No tasks
            </p>
          )}
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

export function KanbanBoard() {
  const listId = useFlowStore((s) => s.selectedListId)
  const statusMap = useFlowStore((s) => s.statuses)
  const taskMap = useFlowStore((s) => s.tasks)
  const users = useFlowStore((s) => s.users)
  const openTask = useFlowStore((s) => s.openTask)
  const moveTask = useFlowStore((s) => s.moveTask)
  const [activeId, setActiveId] = useState<string | null>(null)

  const statuses = Object.values(statusMap)
    .filter((st) => st.listId === listId)
    .sort((a, b) => a.position - b.position)
  const tasks = listId ? tasksForList(taskMap, listId) : []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : undefined

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || !listId) return
    const taskId = String(active.id)
    const overId = String(over.id)
    if (overId.startsWith('column:')) {
      const statusId = overId.slice('column:'.length)
      moveTask({ taskId, listId, statusId, beforeTaskId: null })
      return
    }
    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask || overTask.id === taskId) return
    moveTask({
      taskId,
      listId: overTask.primaryListId,
      statusId: overTask.statusId,
      beforeTaskId: overTask.id,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-auto p-4">
        {statuses.map((status) => (
          <Column
            key={status.id}
            status={status}
            tasks={tasks.filter((t) => t.statusId === status.id).sort((a, b) => a.position - b.position)}
            onOpen={(id) => openTask(id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <div className="w-72"><TaskCard task={activeTask} users={users} /></div> : null}
      </DragOverlay>
    </DndContext>
  )
}
