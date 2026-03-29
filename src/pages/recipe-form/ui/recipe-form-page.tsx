import { useState } from 'react'

import { DeleteDialog } from '@/features/recipe-delete'
import { HeaderMenu } from '@/widgets/header-menu'
import { RecipeForm } from '@/widgets/recipe-form'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
}

export function RecipeFormPage({ mode, recipeId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isEdit = mode === 'edit' && !!recipeId

  return (
    <>
      <RecipeForm
        mode={mode}
        recipeId={recipeId}
        headerRight={<HeaderMenu onDelete={isEdit ? () => setDeleteOpen(true) : undefined} />}
      />
      {isEdit && (
        <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
      )}
    </>
  )
}
