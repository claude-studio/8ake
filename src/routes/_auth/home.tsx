import { createFileRoute } from '@tanstack/react-router'

import { RecipeListPage } from '@/pages/recipe-list'
import { RouteError } from '@/shared/ui'

type HomeSearch = {
  tag?: string
}

export const Route = createFileRoute('/_auth/home')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }),
  component: RecipeListPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} onReset={reset} />,
})
