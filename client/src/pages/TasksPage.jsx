import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/store/taskStore'

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Todo', value: 'todo' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'All priorities', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

export function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const meta = useTaskStore((state) => state.meta)
  const status = useTaskStore((state) => state.status)
  const error = useTaskStore((state) => state.error)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  useEffect(() => {
    fetchTasks(query)
  }, [fetchTasks, query])

  const canGoBack = query.page > 1
  const canGoForward = meta ? query.page < meta.totalPages : false
  const summary = useMemo(() => `${meta?.total || 0} task${meta?.total === 1 ? '' : 's'}`, [meta])

  function updateQuery(nextQuery) {
    setQuery((current) => ({
      ...current,
      ...nextQuery,
      page: nextQuery.page || 1,
    }))
  }

  function submitSearch(event) {
    event.preventDefault()
    updateQuery({ search: searchInput.trim() })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
        <Button>Create task</Button>
      </div>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[1fr_170px_170px_170px_130px]" onSubmit={submitSearch}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pl-9"
              placeholder="Search tasks"
            />
          </div>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={query.status}
            onChange={(event) => updateQuery({ status: event.target.value })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={query.priority}
            onChange={(event) => updateQuery({ priority: event.target.value })}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={`${query.sortBy}:${query.sortOrder}`}
            onChange={(event) => {
              const [sortBy, sortOrder] = event.target.value.split(':')
              updateQuery({ sortBy, sortOrder })
            }}
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="dueDate:asc">Due first</option>
            <option value="priority:desc">Priority</option>
            <option value="title:asc">Title</option>
          </select>

          <Button type="submit">Search</Button>
        </form>
      </section>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="space-y-3">
        {status === 'loading' && (
          <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Loading tasks...
          </div>
        )}

        {status !== 'loading' && tasks.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
            No tasks found.
          </div>
        )}

        {status !== 'loading' &&
          tasks.map((task) => (
            <article key={task._id} className="rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{task.title}</h2>
                  {task.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Badge tone={statusTone(task.status)}>{formatStatus(task.status)}</Badge>
                  <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>Assigned to {task.assignedTo?.name || 'Unassigned'}</span>
                {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                {task.tags?.map((tag) => (
                  <span key={tag} className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {meta?.page || query.page} of {meta?.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoBack}
            onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoForward}
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, tone }) {
  return (
    <span className={cn('rounded-md px-2 py-1 text-xs font-medium capitalize', tone)}>
      {children}
    </span>
  )
}

function statusTone(status) {
  const tones = {
    todo: 'bg-secondary text-secondary-foreground',
    'in-progress': 'bg-accent text-accent-foreground',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
    done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  }

  return tones[status] || tones.todo
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

function formatStatus(status) {
  return status?.replace('-', ' ') || 'todo'
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
