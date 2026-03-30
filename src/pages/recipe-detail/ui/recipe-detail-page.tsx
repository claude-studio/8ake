import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { useRecipe } from '@/entities/recipe'
import { useAuthStore } from '@/features/auth'
import { DeleteDialog } from '@/features/recipe-delete'
import { PageHeader } from '@/shared/ui'
import { HeaderMenu } from '@/widgets/header-menu'
import { RecipeDetail } from '@/widgets/recipe-detail'
import { ReviewList } from '@/widgets/review-list'

interface Props {
  recipeId: string
}

export function RecipeDetailPage({ recipeId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: recipe } = useRecipe(recipeId)
  const isOwner = !!user && !!recipe && recipe.user_id === user.id

  return (
    <div className="pb-20">
      <PageHeader
        title="레시피 상세"
        right={
          <HeaderMenu
            onEdit={
              isOwner
                ? () => navigate({ to: '/recipe/$id/edit', params: { id: recipeId } })
                : undefined
            }
            onDelete={isOwner ? () => setDeleteOpen(true) : undefined}
          />
        }
      />
      <RecipeDetail recipeId={recipeId} reviewListSlot={<ReviewList recipeId={recipeId} />} />
      <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
