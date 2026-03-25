import { RouterProvider, createRouter } from '@tanstack/react-router'

import { routeTree } from '../routeTree.gen'

const router = createRouter({
  routeTree,
  context: {
    auth: { session: null },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return <RouterProvider router={router} />
}
