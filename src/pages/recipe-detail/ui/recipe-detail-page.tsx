import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

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

  return (
    <div className="pb-20">
      <PageHeader
        title="레시피 상세"
        right={
          <HeaderMenu
            onEdit={() => navigate({ to: '/recipe/$id/edit', params: { id: recipeId } })}
            onDelete={() => setDeleteOpen(true)}
          />
        }
      />
      <RecipeDetail recipeId={recipeId} reviewListSlot={<ReviewList recipeId={recipeId} />} />
      <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
