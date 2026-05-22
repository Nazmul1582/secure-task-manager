import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tasksApi } from '@/api/tasks'
import { getNextPosition } from '@/lib/kanbanPosition'
import { useTaskStore } from '@/store/taskStore'
import { KanbanPage } from './KanbanPage'

vi.mock('@/api/tasks', () => ({
  tasksApi: {
    list: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  },
}))

describe('KanbanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tasksApi.list.mockResolvedValue({
      data: {
        tasks: [
          {
            _id: 'task-1',
            description: 'This description should render as a single truncated line.',
            priority: 'urgent',
            status: 'todo',
            title: 'Board task',
          },
        ],
      },
      meta: {
        limit: 100,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    })
    useTaskStore.setState({
      currentTask: null,
      error: null,
      filters: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      meta: null,
      status: 'idle',
      tasks: [],
    })
  })

  it('renders task title as card text with edit and delete icon actions', async () => {
    render(
      <MemoryRouter>
        <KanbanPage />
      </MemoryRouter>,
    )

    const title = await screen.findByText('Board task')

    expect(title.closest('a')).toBeNull()
    expect(screen.getByText(/single truncated line/i)).toHaveClass('truncate')
    expect(screen.getByText(/urgent/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit board task/i })).toHaveAttribute(
      'href',
      '/tasks/task-1/edit',
    )
    expect(screen.getByRole('button', { name: /delete board task/i })).toBeInTheDocument()
  })

  it('calculates a persisted position between neighboring cards in the same column', () => {
    const position = getNextPosition(
      [
        { _id: 'task-1', position: 1000, status: 'todo' },
        { _id: 'task-2', position: 2000, status: 'todo' },
        { _id: 'task-3', position: 3000, status: 'todo' },
      ],
      'task-3',
      'task-2',
      'todo',
    )

    expect(position).toBe(1500)
  })
})
