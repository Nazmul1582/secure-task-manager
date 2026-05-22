import { Save, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'

const roles = ['member', 'admin']

export function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user)
  const users = useUserStore((state) => state.users)
  const status = useUserStore((state) => state.status)
  const error = useUserStore((state) => state.error)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const updateUserRole = useUserStore((state) => state.updateUserRole)
  const [draftRoles, setDraftRoles] = useState({})

  useEffect(() => {
    fetchUsers().catch(() => {})
  }, [fetchUsers])

  const summary = useMemo(
    () => ({
      admins: users.filter((user) => user.role === 'admin').length,
      members: users.filter((user) => user.role === 'member').length,
      total: users.length,
    }),
    [users],
  )

  async function handleSave(user) {
    const nextRole = draftRoles[user._id]

    if (!nextRole || nextRole === user.role) {
      return
    }

    if (user._id === currentUser?._id && nextRole !== 'admin') {
      toast.error('You cannot remove your own admin role')
      return
    }

    try {
      await updateUserRole(user._id, nextRole)
      toast.success('User role updated')
    } catch (updateError) {
      toast.error(updateError.response?.data?.message || 'Unable to update user role')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage workspace access and admin roles.</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStat label="Total users" value={summary.total} />
        <AdminStat label="Admins" value={summary.admins} />
        <AdminStat label="Members" value={summary.members} />
      </div>

      <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Users className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Users</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'loading' ? 'Loading users...' : `${summary.total} active accounts`}
            </p>
          </div>
        </div>

        {status !== 'loading' && users.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No active users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isCurrentUser = user._id === currentUser?._id
                  const draftRole = draftRoles[user._id] || user.role
                  const unchanged = draftRole === user.role

                  return (
                    <tr key={user._id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                            {getInitials(user.name)}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.name}
                              {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <ShieldCheck className="size-4 text-primary" aria-hidden="true" />}
                          <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            value={draftRole}
                            disabled={isCurrentUser}
                            onChange={(event) =>
                              setDraftRoles((current) => ({ ...current, [user._id]: event.target.value }))
                            }
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={unchanged || isCurrentUser}
                          onClick={() => handleSave(user)}
                        >
                          <Save className="size-4" aria-hidden="true" />
                          Save
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function AdminStat({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}
