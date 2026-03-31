import { createFileRoute, redirect } from '@tanstack/react-router'

import { LandingPage } from '@/pages/landing'

export const Route = createFileRoute('/welcome')({
  beforeLoad: ({ context }) => {
    if (context.auth?.session) {
      throw redirect({ to: '/' })
    }
  },
  component: LandingPage,
})
