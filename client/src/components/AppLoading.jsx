import { ShieldCheck } from 'lucide-react'

export function AppLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-sm font-medium text-muted-foreground shadow-xl">
        <span className="flex size-10 items-center justify-center rounded-md border border-border bg-card text-primary shadow-sm">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        secureTaskManager
      </div>
    </main>
  )
}
