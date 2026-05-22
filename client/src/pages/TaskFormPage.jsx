import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { useTaskStore } from '@/store/taskStore'

const taskSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(140),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
})

export function TaskFormPage({ mode }) {
  const { t } = useI18n()
  const { id } = useParams()
  const navigate = useNavigate()
  const currentTask = useTaskStore((state) => state.currentTask)
  const status = useTaskStore((state) => state.status)
  const getTask = useTaskStore((state) => state.getTask)
  const createTask = useTaskStore((state) => state.createTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaultValues(),
  })

  const isEdit = mode === 'edit'
  const isLoading = isSubmitting || status === 'loading'

  useEffect(() => {
    if (isEdit && id) {
      getTask(id)
        .then((task) => reset(getDefaultValues(task)))
        .catch(() => {})
    }
  }, [getTask, id, isEdit, reset])

  async function onSubmit(values) {
    const payload = toPayload(values)

    try {
      if (isEdit) {
        await updateTask(id, payload)
      } else {
        await createTask(payload)
      }

      toast.success(isEdit ? 'Task updated' : 'Task created')
      navigate('/tasks')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save task')
      setError('root', {
        message: error.response?.data?.message || 'Unable to save task',
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link aria-label="Back to tasks" title="Back to tasks" to="/tasks">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit task' : t('createTask')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit ? currentTask?.title || t('updateTaskDetails') : t('addTaskWorkspace')}
          </p>
        </div>
      </div>

      <form
        className="space-y-5 rounded-md border border-border bg-card p-5 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field label="Title" error={errors.title?.message}>
          <Input {...register('title')} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('description')}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" error={errors.status?.message}>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('status')}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </Field>

          <Field label="Priority" error={errors.priority?.message}>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Due date" error={errors.dueDate?.message}>
            <Input type="date" {...register('dueDate')} />
          </Field>

          <Field label="Tags" error={errors.tags?.message}>
            <Input placeholder="frontend, api" {...register('tags')} />
          </Field>
        </div>

        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link to="/tasks">{t('cancel')}</Link>
          </Button>
          <Button disabled={isLoading}>
            <Save className="size-4" aria-hidden="true" />
            {isLoading ? 'Saving...' : t('saveTask')}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-destructive">{error}</span>}
    </label>
  )
}

function getDefaultValues(task) {
  return {
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    tags: task?.tags?.join(', ') || '',
  }
}

function toPayload(values) {
  return {
    title: values.title,
    description: values.description || '',
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate || null,
    tags: values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  }
}
