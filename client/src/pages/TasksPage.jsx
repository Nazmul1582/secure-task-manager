export function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search, filter, and manage assigned work.</p>
      </div>
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    </div>
  )
}

