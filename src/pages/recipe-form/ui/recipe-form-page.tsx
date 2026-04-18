import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { useRecipe } from '@/entities/recipe'
import { useAuthStore } from '@/features/auth'
import { DeleteDialog } from '@/features/recipe-delete'
import { HeaderMenu } from '@/widgets/header-menu'
import { RecipeForm } from '@/widgets/recipe-form'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
}

export function RecipeFormPage({ mode, recipeId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: recipe, isLoading: recipeLoading } = useRecipe(recipeId ?? '')

  const isEdit = mode === 'edit' && !!recipeId
  const isOwner = !isEdit || (!!user && !!recipe && recipe.user_id === user.id)

  // 소유자가 아닌 경우 상세 페이지로 리다이렉트
  if (isEdit && recipe && !isOwner) {
    navigate({ to: '/recipe/$id', params: { id: recipeId! } })
    return null
  }

  return (
    <>
      <RecipeForm
        mode={mode}
        recipeId={recipeId}
        isDataLoading={isEdit && recipeLoading}
        headerRight={
          <HeaderMenu onDelete={isEdit && isOwner ? () => setDeleteOpen(true) : undefined} />
        }
      />
      {isEdit && isOwner && (
        <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
      )}
    </>
  )
}
