import { createFileRoute } from '@tanstack/react-router'

import { DashboardPage } from '@/pages/dashboard'
import { RouteError } from '@/shared/ui'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} onReset={reset} />,
})
