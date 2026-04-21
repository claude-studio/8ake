import { useEffect, useMemo } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { useAuthStore } from '@/features/auth'
import { OfflineBanner, PwaPrompt } from '@/features/pwa'
import { queryClient } from '@/shared/api'
import { ErrorBoundary } from '@/shared/ui'

import { routeTree } from '../routeTree.gen'

const TOAST_OPTIONS = {
  duration: 3000,
  style: {
    background: 'var(--card)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  },
  classNames: {
    error: 'border-destructive! bg-destructive! text-destructive-foreground!',
  },
}

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  const { session, isLoading, initialize } = useAuthStore()

  const routerContext = useMemo(() => ({ auth: { session } }), [session])

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={routerContext} />
        <Toaster position="top-center" closeButton toastOptions={TOAST_OPTIONS} />
        <OfflineBanner />
        <PwaPrompt />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
