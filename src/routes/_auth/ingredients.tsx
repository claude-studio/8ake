import { createFileRoute } from '@tanstack/react-router'

import { IngredientPage } from '@/pages/ingredient'
import { RouteError } from '@/shared/ui'

export const Route = createFileRoute('/_auth/ingredients')({
  component: IngredientPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} onReset={reset} />,
})
