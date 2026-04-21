import { useCallback, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { updateRecipe, recipeKeys, useRecipe } from '@/entities/recipe'
import { useAuthStore } from '@/features/auth'
import { DeleteDialog } from '@/features/recipe-delete'
import { PageHeader } from '@/shared/ui'
import { CommentList } from '@/widgets/comment-list'
import { HeaderMenu } from '@/widgets/header-menu'
import { RecipeDetail } from '@/widgets/recipe-detail'
import { ReviewList } from '@/widgets/review-list'

interface Props {
  recipeId: string
}

export function RecipeDetailPage({ recipeId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { data: recipe } = useRecipe(recipeId)
  const isOwner = !!user && !!recipe && recipe.user_id === user.id

  const handleTogglePublic = useCallback(async () => {
    if (!recipe) return
    const nextValue = !recipe.is_public

    // 낙관적 업데이트
    queryClient.setQueryData(recipeKeys.detail(recipeId), {
      ...recipe,
      is_public: nextValue,
    })

    try {
      await updateRecipe(recipeId, { is_public: nextValue })
      toast.success(nextValue ? '공개로 전환되었습니다' : '비공개로 전환되었습니다')
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
    } catch {
      // 실패 시 롤백
      queryClient.setQueryData(recipeKeys.detail(recipeId), recipe)
      toast.error('공개 설정 변경에 실패했습니다')
    }
  }, [recipe, recipeId, queryClient])

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
      <RecipeDetail
        recipeId={recipeId}
        reviewListSlot={<ReviewList recipeId={recipeId} />}
        commentListSlot={<CommentList recipeId={recipeId} isPublic={recipe?.is_public ?? false} />}
        isOwner={isOwner}
        onTogglePublic={handleTogglePublic}
      />
      <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
