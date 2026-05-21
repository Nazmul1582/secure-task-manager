const columns = ['Todo', 'In progress', 'Review', 'Done']

export function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kanban</h1>
        <p className="mt-1 text-sm text-muted-foreground">Board view grouped by task status.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="min-h-64 rounded-md border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium">{column}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

