import { createFileRoute, redirect, Outlet, useRouterState } from '@tanstack/react-router'

import { AppLayout } from '@/shared/ui'

function AuthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // 레시피 상세/폼 — 탭바 숨김 (풀스크린 경험), 재료 페이지는 탭바 유지
  const hideNav = /^\/recipe\/.+/.test(pathname) || pathname === '/recipe/new'

  return (
    <AppLayout hideNav={hideNav}>
      <Outlet />
    </AppLayout>
  )
}

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.session) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout,
})
