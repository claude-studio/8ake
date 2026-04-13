import { useEffect } from 'react'

import { createRootRouteWithContext, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AlertTriangle, Home, SearchX } from 'lucide-react'

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

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-(--shadow-card)">
        <SearchX size={36} className="text-primary opacity-60" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Link
        to="/home"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Home size={16} />
        홈으로 이동
      </Link>
    </div>
  )
}

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-card shadow-(--shadow-card)">
        <AlertTriangle size={36} className="text-destructive opacity-60" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">문제가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
        >
          다시 시도
        </button>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Home size={16} />
          홈으로 이동
        </Link>
      </div>
    </div>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <ScrollToTop />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="top-left" />}
    </>
  ),
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
})
