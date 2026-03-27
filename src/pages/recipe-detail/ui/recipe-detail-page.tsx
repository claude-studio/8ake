import { useState } from 'react'

import { Link } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/features/recipe-delete'
import { PageHeader } from '@/shared/ui'
import { RecipeDetail } from '@/widgets/recipe-detail'
import { ReviewList } from '@/widgets/review-list'

interface Props {
  recipeId: string
}

export function RecipeDetailPage({ recipeId }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const rightActions = (
    <>
      <Button variant="ghost" size="icon-sm" asChild title="수정">
        <Link to="/recipe/$id/edit" params={{ id: recipeId }}>
          <Pencil size={16} />
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setDeleteOpen(true)}
        title="삭제"
        className="text-[var(--destructive)]"
      >
        <Trash2 size={16} />
      </Button>
    </>
  )

  return (
    <div className="pb-20">
      <PageHeader title="레시피 상세" right={rightActions} />
      <RecipeDetail recipeId={recipeId} reviewListSlot={<ReviewList recipeId={recipeId} />} />
      <DeleteDialog recipeId={recipeId} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
