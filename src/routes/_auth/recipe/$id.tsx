import { createFileRoute } from '@tanstack/react-router'

import { RecipeDetailPage } from '@/pages/recipe-detail'
import { RouteError } from '@/shared/ui'

export const Route = createFileRoute('/_auth/recipe/$id')({
  component: function RecipeDetailRoute() {
    const { id } = Route.useParams()
    return <RecipeDetailPage recipeId={id} />
  },
  errorComponent: ({ error, reset }) => <RouteError error={error} onReset={reset} />,
})
