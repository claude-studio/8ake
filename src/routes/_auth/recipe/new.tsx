import { createFileRoute } from '@tanstack/react-router'

import { RecipeFormPage } from '@/pages/recipe-form'
import { RouteError } from '@/shared/ui'

function RecipeNewRoute() {
  return <RecipeFormPage mode="create" />
}

export const Route = createFileRoute('/_auth/recipe/new')({
  component: RecipeNewRoute,
  errorComponent: ({ error, reset }) => <RouteError error={error} onReset={reset} />,
})
