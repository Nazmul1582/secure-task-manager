import { ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'

export function AuthLayout() {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
      <section className="hidden border-r border-border bg-secondary/35 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-14">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary shadow-sm">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          secureTaskManager
        </div>
        <div className="max-w-xl">
          <p className="text-3xl font-semibold leading-tight">
            Plan work, protect sessions, ship with confidence.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A focused workspace for task ownership, deadlines, priorities, and secure account access.
          </p>
        </div>
      </section>
      <section className="relative flex min-h-svh items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[26rem]">
          <div className="mb-10 flex items-center gap-3 text-sm font-medium lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            secureTaskManager
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  )
}
