import { Bell, Globe2, LogOut, Mail, Moon, Trash2, User, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export function SettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const changePassword = useAuthStore((state) => state.changePassword)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const [profile, setProfile] = useState({
    email: user?.email || '',
    name: user?.name || '',
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleProfileSubmit(event) {
    event.preventDefault()

    try {
      await updateProfile(profile)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile')
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()

    try {
      await changePassword(passwords)
      toast.success('Password changed. Please sign in again.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password')
    }
  }

  async function handleLogout() {
    await logout()
    toast.success('Signed out')
    navigate('/login', { replace: true })
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount()
      toast.success('Account deleted')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete account')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account and security preferences.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Profile</h2>
        <form
          className="space-y-3 rounded-md border border-border bg-card p-5 shadow-sm"
          onSubmit={handleProfileSubmit}
        >
          <SettingsField icon={User} label="Username">
            <Input
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
            />
          </SettingsField>
          <SettingsField icon={Mail} label="E-mail">
            <Input
              type="email"
              value={profile.email}
              onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </SettingsField>
          <Button type="submit">Save profile</Button>
        </form>

        <form
          className="space-y-3 rounded-md border border-border bg-card p-5 shadow-sm"
          onSubmit={handlePasswordSubmit}
        >
          <SettingsField icon={Lock} label="Current password">
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(event) =>
                setPasswords((current) => ({ ...current, currentPassword: event.target.value }))
              }
              placeholder="Current password"
            />
          </SettingsField>
          <SettingsField icon={Lock} label="New password">
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(event) =>
                setPasswords((current) => ({ ...current, newPassword: event.target.value }))
              }
              placeholder="New password"
            />
          </SettingsField>
          <Button type="submit" variant="outline">
            Change password
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">System</h2>
        <div className="divide-y divide-border rounded-md border border-border bg-card shadow-sm">
          <StaticRow icon={Moon} label="Dark Mode" value="Use the header toggle" />
          <StaticRow icon={Bell} label="Notification" value="Coming soon" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Account</h2>
        <div className="divide-y divide-border rounded-md border border-border bg-card shadow-sm">
          <StaticRow icon={Globe2} label="Language" value="English" />
          <button
            className="flex w-full items-center justify-between p-4 text-left text-sm"
            type="button"
            onClick={handleLogout}
          >
            <span className="font-medium text-primary">Logout</span>
            <LogOut className="size-4 text-primary" aria-hidden="true" />
          </button>
          <button
            className="flex w-full items-center justify-between p-4 text-left text-sm text-destructive"
            type="button"
            onClick={() => setDeleteOpen(true)}
          >
            <span className="font-medium">Delete My Account</span>
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete account?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will delete your account and you will not be able to sign in again.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                Delete account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsField({ children, icon: Icon, label }) {
  return (
    <label className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        {label}
      </span>
      {children}
    </label>
  )
}

function StaticRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className={cn('text-xs text-muted-foreground')}>{value}</p>
        </div>
      </div>
    </div>
  )
}
