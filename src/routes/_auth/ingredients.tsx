import { createFileRoute } from '@tanstack/react-router'

import { IngredientPage } from '@/pages/ingredient'

export const Route = createFileRoute('/_auth/ingredients')({
  component: IngredientPage,
})
