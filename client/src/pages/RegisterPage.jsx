import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      navigate('/', { replace: true })
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Unable to create account',
      })
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Start with a member workspace.</p>
      <form className="mt-6 space-y-4 rounded-md border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="name" autoComplete="name" className="pl-9" {...register('name')} />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-email" type="email" autoComplete="email" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-password">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-password" type="password" autoComplete="new-password" className="pl-9" {...register('password')} />
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-password">
            Confirm password
          </label>
          <Input id="confirm-password" type="password" autoComplete="new-password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

        <Button className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        Already registered?{' '}
        <Link className="font-medium text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  )
}
