import { ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-border bg-secondary/40 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary shadow-sm">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          secureTaskManager
        </div>
        <div className="max-w-xl">
          <p className="text-3xl font-semibold leading-tight">Plan work, protect sessions, ship with confidence.</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A focused workspace for task ownership, deadlines, priorities, and secure account access.
          </p>
        </div>
      </section>
      <section className="flex min-h-svh items-center justify-center px-6 py-10">
        <Outlet />
      </section>
    </main>
  )
}

