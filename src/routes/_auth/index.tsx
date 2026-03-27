import { createFileRoute } from '@tanstack/react-router'

import { RecipeListPage } from '@/pages/recipe-list'

export const Route = createFileRoute('/_auth/')({
  component: RecipeListPage,
})
