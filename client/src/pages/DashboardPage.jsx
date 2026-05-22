import { useEffect, useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'

export function DashboardPage() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const tasks = useTaskStore((state) => state.tasks)
  const status = useTaskStore((state) => state.status)
  const error = useTaskStore((state) => state.error)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const users = useUserStore((state) => state.users)
  const userStatus = useUserStore((state) => state.status)
  const userError = useUserStore((state) => state.error)
  const fetchUsers = useUserStore((state) => state.fetchUsers)

  useEffect(() => {
    fetchTasks({ limit: 100 })
  }, [fetchTasks])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers().catch(() => {})
    }
  }, [fetchUsers, user?.role])

  const dashboard = useMemo(() => buildDashboard(tasks), [tasks])
  const adminSummary = useMemo(
    () => ({
      admins: users.filter((item) => item.role === 'admin').length,
      members: users.filter((item) => item.role === 'member').length,
      total: users.length,
    }),
    [users],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dashboard')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('overview')}</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {user?.role === 'admin' && (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Admin overview</h2>
            <p className="text-sm text-muted-foreground">
              {userStatus === 'loading' ? 'Loading users...' : 'Workspace user access summary'}
            </p>
          </div>
          {userError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {userError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <DashboardStat label="Total users" value={adminSummary.total} />
            <DashboardStat label="Admins" value={adminSummary.admins} />
            <DashboardStat label="Members" value={adminSummary.members} />
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {dashboard.stats.map((stat) => (
          <DashboardStat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Completed tasks</h2>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              {status === 'loading' ? 'Loading' : `${dashboard.completedCount} done`}
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.16}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold">Upcoming deadlines</h2>
            <p className="text-sm text-muted-foreground">Next incomplete tasks by due date</p>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.upcoming.length ? (
              dashboard.upcoming.map((task) => (
                <div key={task._id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                No upcoming deadlines.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function DashboardStat({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function buildDashboard(tasks) {
  const now = new Date()
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(now.getDate() + 7)

  const openTasks = tasks.filter((task) => task.status !== 'done')
  const completedTasks = tasks.filter((task) => task.status === 'done')
  const dueSoon = openTasks.filter((task) => {
    if (!task.dueDate) {
      return false
    }

    const dueDate = new Date(task.dueDate)
    return dueDate >= now && dueDate <= sevenDaysFromNow
  })

  return {
    completedCount: completedTasks.length,
    stats: [
      { label: 'Open tasks', value: openTasks.length },
      { label: 'Completed', value: completedTasks.length },
      { label: 'Due soon', value: dueSoon.length },
    ],
    chartData: buildCompletedChart(completedTasks),
    upcoming: dueSoon
      .toSorted((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
      .slice(0, 5),
  }
}

function buildCompletedChart(tasks) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)

    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      completed: tasks.filter((task) => task.updatedAt?.slice(0, 10) === key).length,
    }
  })
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
