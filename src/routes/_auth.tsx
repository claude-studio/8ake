import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.session) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})
