import { ShieldCheck } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'

export function AuthLayout() {
  return (
    <main className="grid min-h-svh bg-background p-0 text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:p-6">
      <section className="hidden rounded-l-2xl border-y border-l border-border bg-card/80 px-10 py-12 shadow-xl lg:flex lg:flex-col lg:justify-between xl:px-14">
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
      <section className="relative flex min-h-svh items-center justify-center bg-card px-5 py-10 shadow-xl sm:px-8 lg:min-h-[calc(100svh-3rem)] lg:rounded-r-2xl lg:border-y lg:border-r lg:border-border lg:px-12">
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
