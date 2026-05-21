import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Start with a member workspace.</p>
      <div className="mt-6 rounded-md border border-border bg-card p-5 shadow-sm">
        <Button className="w-full" disabled>
          Registration form
        </Button>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        Already registered?{' '}
        <Link className="font-medium text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  )
}

