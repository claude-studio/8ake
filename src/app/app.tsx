import { useEffect } from 'react'

import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { useAuthStore } from '@/features/auth'

import { routeTree } from '../routeTree.gen'

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

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div
          className="size-8  rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <>
      <RouterProvider router={router} context={{ auth: { session } }} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  )
}
