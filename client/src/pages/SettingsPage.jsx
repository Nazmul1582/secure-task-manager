export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account and security preferences.</p>
      </div>
      <div className="rounded-md border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Password and session controls.</p>
      </div>
    </div>
  )
}

