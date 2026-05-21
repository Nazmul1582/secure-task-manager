import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page is unavailable.</p>
        <Button asChild className="mt-6">
          <Link to="/">Dashboard</Link>
        </Button>
      </div>
    </main>
  )
}

