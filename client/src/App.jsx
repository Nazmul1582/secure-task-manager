import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

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

function App() {
  const status = useAuthStore((state) => state.status)
  const refresh = useAuthStore((state) => state.refresh)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    let isActive = true

    async function bootstrapSession() {
      if (status === 'idle') {
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
  }, [refresh, status])

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
