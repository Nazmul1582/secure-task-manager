import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const { t } = useI18n()
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
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in')
      setError('root', {
        message: error.response?.data?.message || 'Unable to sign in',
      })
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold">{t('signIn')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('useAccount')}</p>
      <form
        className="mt-6 space-y-5 rounded-md border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            {t('email')}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            {t('password')}
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-9"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : t('signIn')}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {t('newHere')}{' '}
        <Link className="font-medium text-primary hover:underline" to="/register">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  )
}
