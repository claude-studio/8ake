import { RecipeForm } from '@/widgets/recipe-form'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
}

export function RecipeFormPage({ mode, recipeId }: Props) {
  return <RecipeForm mode={mode} recipeId={recipeId} />
}
