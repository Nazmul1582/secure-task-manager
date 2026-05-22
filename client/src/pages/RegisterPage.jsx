import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export function RegisterPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const registerAccount = useAuthStore((state) => state.register)
  const status = useAuthStore((state) => state.status)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const isLoading = isSubmitting || status === 'loading'

  async function onSubmit(values) {
    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      toast.success('Account created')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account')
      setError('root', {
        message: error.response?.data?.message || 'Unable to create account',
      })
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold">{t('createAccount')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t('startWorkspace')}</p>
      <form
        className="mt-6 space-y-5 rounded-md border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            {t('name')}
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="name"
              autoComplete="name"
              placeholder="Md. Nazmul Hasan"
              className="pl-9"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-email">
            {t('email')}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="register-email"
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
          <label className="text-sm font-medium" htmlFor="register-password">
            {t('password')}
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create an 8+ character password"
              className="pl-9"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-password">
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="pl-9"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : t('createAccount')}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {t('alreadyRegistered')}{' '}
        <Link className="font-medium text-primary hover:underline" to="/login">
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}
