import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/taskStore'

const columns = [
  { label: 'Todo', status: 'todo' },
  { label: 'In progress', status: 'in-progress' },
  { label: 'Review', status: 'review' },
  { label: 'Done', status: 'done' },
]

export function KanbanPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const status = useTaskStore((state) => state.status)
  const error = useTaskStore((state) => state.error)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const updateTask = useTaskStore((state) => state.updateTask)

  useEffect(() => {
    fetchTasks({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
  }, [fetchTasks])

  const groupedTasks = useMemo(
    () =>
      columns.reduce((groups, column) => {
        groups[column.status] = tasks.filter((task) => task.status === column.status)
        return groups
      }, {}),
    [tasks],
  )

  async function handleDragEnd(event) {
    const taskId = event.active?.id
    const nextStatus = event.over?.id
    const task = tasks.find((item) => item._id === taskId)

    if (!task || !nextStatus || task.status === nextStatus) {
      return
    }

    try {
      await updateTask(taskId, { status: nextStatus })
      toast.success('Task moved')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to move task')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kanban</h1>
          <p className="mt-1 text-sm text-muted-foreground">Board view grouped by task status.</p>
        </div>
        <Button asChild>
          <Link to="/tasks/new">Create task</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={groupedTasks[column.status] || []}
              loading={status === 'loading'}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ column, tasks, loading }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.status,
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'min-h-96 rounded-md border border-border bg-card p-4 shadow-sm transition-colors',
        isOver && 'border-primary bg-primary/5',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{column.label}</h2>
        <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No tasks.
          </p>
        )}
        {!loading && tasks.map((task) => <KanbanCard key={task._id} task={task} />)}
      </div>
    </section>
  )
}

function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md border border-border bg-background p-3 shadow-sm transition-shadow',
        isDragging && 'relative z-10 shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 rounded text-muted-foreground hover:text-foreground"
          type="button"
          title="Drag task"
          aria-label="Drag task"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            to={`/tasks/${task._id}/edit`}
            className="block truncate text-sm font-medium hover:text-primary"
          >
            {task.title}
          </Link>
          <p className="mt-1 text-xs capitalize text-muted-foreground">{task.priority}</p>
        </div>
      </div>
    </article>
  )
}
