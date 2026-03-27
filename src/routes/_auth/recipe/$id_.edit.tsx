import { createFileRoute } from '@tanstack/react-router'

import { RecipeFormPage } from '@/pages/recipe-form'

export const Route = createFileRoute('/_auth/recipe/$id_/edit')({
  component: function EditRoute() {
    const { id } = Route.useParams()
    return <RecipeFormPage mode="edit" recipeId={id} />
  },
})
