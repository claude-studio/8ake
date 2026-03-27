import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import type { Session } from '@supabase/supabase-js'

interface RouterContext {
  auth: {
    session: Session | null
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <ScrollRestoration getKey={(location) => location.pathname} />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
