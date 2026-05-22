import { UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'

export function TaskUserBadges({ assignedTo, className, createdBy }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <TaskUserBadge label="Created by" user={createdBy} />
      <TaskUserBadge label="Assigned to" user={assignedTo} fallback="Unassigned" />
    </div>
  )
}

function TaskUserBadge({ fallback = 'Unknown', label, user }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
      <UserRound className="size-3 shrink-0" aria-hidden="true" />
      <span className="shrink-0">{label}</span>
      <span className="truncate">{user?.name || fallback}</span>
    </span>
  )
}
