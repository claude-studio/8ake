import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingPage } from '@/pages/landing'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth?.session) {
      throw redirect({ to: '/home' })
    }
  },
  component: LandingPage,
})
