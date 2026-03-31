import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginPage } from '@/pages/login'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth?.session) {
      throw redirect({ to: '/home' })
    }
  },
  component: LoginPage,
})
