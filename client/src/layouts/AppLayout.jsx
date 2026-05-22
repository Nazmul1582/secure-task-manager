import { LayoutDashboard, ListTodo, LogOut, PanelsTopLeft, Settings, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navigation = [
  { labelKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { labelKey: 'tasks', href: '/tasks', icon: ListTodo },
  { labelKey: 'kanban', href: '/tasks/kanban', icon: PanelsTopLeft },
  { labelKey: 'settings', href: '/settings', icon: Settings },
]

export function AppLayout() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  async function handleLogout() {
    await logout()
    toast.success('Signed out')
  }

  return (
    <main className="min-h-svh bg-background p-0 text-foreground lg:p-6">
      <div className="mx-auto grid min-h-svh w-full max-w-7xl overflow-hidden bg-card shadow-xl lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[260px_1fr] lg:rounded-2xl lg:border lg:border-border">
        <aside className="border-b border-border bg-card px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-2 text-sm font-semibold">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            secureTaskManager
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground',
                    isActive && 'bg-secondary text-secondary-foreground',
                  )
                }
              >
                <item.icon className="size-4" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex min-h-16 items-center justify-between border-b border-border bg-card/95 px-6">
            <div>
              <p className="text-sm font-medium">{user?.name || 'Member'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'Secure workspace'}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" />
                {t('logout')}
              </Button>
            </div>
          </header>
          <div className="min-w-0 flex-1 bg-muted/40 px-6 py-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}
