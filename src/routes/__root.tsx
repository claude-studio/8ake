import { useEffect } from 'react'

import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import type { Session } from '@supabase/supabase-js'

interface RouterContext {
  auth: {
    session: Session | null
  }
}

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <ScrollToTop />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
