import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your secureTaskManager account.</p>
      <div className="mt-6 rounded-md border border-border bg-card p-5 shadow-sm">
        <Button className="w-full" disabled>
          Login form
        </Button>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        New here?{' '}
        <Link className="font-medium text-primary hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  )
}

