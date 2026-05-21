import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const from = location.state?.from?.pathname || '/'
  const isLoading = isSubmitting || status === 'loading'

  async function onSubmit(values) {
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Unable to sign in',
      })
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your secureTaskManager account.</p>
      <form className="mt-6 space-y-4 rounded-md border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="current-password" className="pl-9" {...register('password')} />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

        <Button className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        New here?{' '}
        <Link className="font-medium text-primary hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  )
}
