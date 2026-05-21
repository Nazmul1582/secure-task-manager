import { ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-10">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary shadow-sm">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          secureTaskManager
        </div>

        <div className="mt-10 max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Secure task management for focused teams.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            The frontend foundation is ready for protected routing, auth screens, dashboards, and task workflows.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Open dashboard</Button>
          <Button variant="outline">Create account</Button>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium">JWT auth</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Access tokens stay in memory while refresh tokens live in HTTP-only cookies.</p>
          </div>
          <div className="rounded-md border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium">Task workflows</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Filtering, search, assignment, priority, due dates, and Kanban views are planned.</p>
          </div>
          <div className="rounded-md border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium">Responsive UI</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Tailwind and shadcn-style primitives are ready for the app screens.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
