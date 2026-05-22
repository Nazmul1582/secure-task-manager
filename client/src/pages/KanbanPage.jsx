import { closestCorners, DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getNextPosition } from '@/lib/kanbanPosition'
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
  const removeTask = useTaskStore((state) => state.removeTask)
  const reorderTasks = useTaskStore((state) => state.reorderTasks)
  const updateTask = useTaskStore((state) => state.updateTask)

  useEffect(() => {
    fetchTasks({ limit: 100, sortBy: 'position', sortOrder: 'asc' })
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
    const overId = event.over?.id
    const nextStatus = event.over?.data?.current?.status || overId
    const task = tasks.find((item) => item._id === taskId)

    if (!task || !overId || !nextStatus) {
      return
    }

    const nextPosition = getNextPosition(tasks, taskId, overId, nextStatus)

    if (task.status === nextStatus && task.position === nextPosition) {
      return
    }

    reorderTasks(taskId, overId, nextStatus, nextPosition)

    try {
      await updateTask(taskId, { position: nextPosition, status: nextStatus })
      toast.success('Task moved')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to move task')
    }
  }

  function confirmDelete(task) {
    toast('Delete task?', {
      description: `"${task.title}" will be permanently removed.`,
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await removeTask(task._id)
            toast.success('Task deleted')
          } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to delete task')
          }
        },
      },
    })
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

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={groupedTasks[column.status] || []}
              loading={status === 'loading'}
              onDeleteTask={confirmDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ column, tasks, loading, onDeleteTask }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.status,
    data: {
      status: column.status,
    },
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
        {!loading &&
          tasks.map((task) => (
            <KanbanCard key={task._id} task={task} status={column.status} onDeleteTask={onDeleteTask} />
          ))}
      </div>
    </section>
  )
}

function KanbanCard({ task, status, onDeleteTask }) {
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: task._id,
    data: {
      status,
    },
  })
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <article
      ref={(node) => {
        setNodeRef(node)
        setDroppableRef(node)
      }}
      style={style}
      className={cn(
        'cursor-grab rounded-md border border-border bg-background p-3 shadow-sm transition-shadow active:cursor-grabbing',
        isDragging && 'relative z-10 shadow-lg',
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="truncate text-sm font-semibold">{task.title}</h3>
          {task.description && (
            <p className="truncate text-xs leading-5 text-muted-foreground">{task.description}</p>
          )}
          <span
            className={cn(
              'inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize',
              priorityTone(task.priority),
            )}
          >
            {task.priority}
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link
              aria-label={`Edit ${task.title}`}
              title="Edit task"
              to={`/tasks/${task._id}/edit`}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Delete ${task.title}`}
            title="Delete task"
            onClick={() => onDeleteTask(task)}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}

function priorityTone(priority) {
  const tones = {
    low: 'bg-secondary text-secondary-foreground',
    medium: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
    urgent: 'bg-destructive/10 text-destructive',
  }

  return tones[priority] || tones.medium
}
