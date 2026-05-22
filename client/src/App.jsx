import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppLoading } from '@/components/AppLoading'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { KanbanPage } from '@/pages/KanbanPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TaskFormPage } from '@/pages/TaskFormPage'
import { TasksPage } from '@/pages/TasksPage'
import { AdminRoute } from '@/routes/AdminRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

const publicAuthRoutes = new Set(['/login', '/register'])

function App() {
  const location = useLocation()
  const clearSession = useAuthStore((state) => state.clearSession)
  const refresh = useAuthStore((state) => state.refresh)
  const [sessionReady, setSessionReady] = useState(false)
  const isPublicAuthRoute = publicAuthRoutes.has(location.pathname)

  useEffect(() => {
    let isActive = true

    async function bootstrapSession() {
      const status = useAuthStore.getState().status

      if (isPublicAuthRoute) {
        if (status === 'idle') {
          clearSession()
        }
      } else if (status !== 'authenticated') {
        await refresh()
      }

      if (isActive) {
        setSessionReady(true)
      }
    }

    bootstrapSession()

    return () => {
      isActive = false
    }
  }, [clearSession, isPublicAuthRoute, refresh])

  if (!sessionReady) {
    return <AppLoading />
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
          <Route path="/tasks/kanban" element={<KanbanPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
