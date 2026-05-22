import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppLoading } from '@/components/AppLoading'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { KanbanPage } from '@/pages/KanbanPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TaskFormPage } from '@/pages/TaskFormPage'
import { TasksPage } from '@/pages/TasksPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

const publicAuthRoutes = new Set(['/login', '/register'])

function App() {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const clearSession = useAuthStore((state) => state.clearSession)
  const refresh = useAuthStore((state) => state.refresh)
  const [sessionReady, setSessionReady] = useState(false)
  const isPublicAuthRoute = publicAuthRoutes.has(location.pathname)

  useEffect(() => {
    let isActive = true

    async function bootstrapSession() {
      if (status === 'idle') {
        if (isPublicAuthRoute) {
          clearSession()
        } else {
          await refresh()
        }
      }

      if (isActive) {
        setSessionReady(true)
      }
    }

    bootstrapSession()

    return () => {
      isActive = false
    }
  }, [clearSession, isPublicAuthRoute, refresh, status])

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
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
