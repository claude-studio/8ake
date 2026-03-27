import { createFileRoute } from '@tanstack/react-router'

import { RecipeFormPage } from '@/pages/recipe-form'

function RecipeNewRoute() {
  return <RecipeFormPage mode="create" />
}

export const Route = createFileRoute('/_auth/recipe/new')({
  component: RecipeNewRoute,
})
