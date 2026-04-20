import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { NotebookPen } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReviews, createReview, updateReview, deleteReview, reviewKeys } from '@/entities/review'
import type { Review } from '@/entities/review'
import { useAuthStore } from '@/features/auth'

import { ReviewCard } from './review-card'
import { ReviewForm } from './review-form'

import type { ReviewFormValues } from '../model/review-schema'

interface Props {
  recipeId: string
}

export function ReviewList({ recipeId }: Props) {
  const user = useAuthStore((s) => s.user)
  const { data: reviews, isLoading } = useReviews(recipeId)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = async (values: ReviewFormValues) => {
    if (!user) return
    try {
      await createReview({
        ...values,
        recipe_id: recipeId,
        user_id: user.id,
      })
      toast.success('회고가 추가되었습니다.')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(recipeId) })
    } catch {
      toast.error('회고 추가에 실패했습니다.')
    }
  }

  const handleUpdate = async (values: ReviewFormValues) => {
    if (!editingReview) return
    try {
      await updateReview(editingReview.id, values)
      toast.success('회고가 수정되었습니다.')
      setEditingReview(null)
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(recipeId) })
    } catch {
      toast.error('회고 수정에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await deleteReview(deletingId)
      toast.success('회고가 삭제되었습니다.')
      setDeletingId(null)
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(recipeId) })
    } catch {
      toast.error('회고 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">회고를 불러오는 중...</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground">회고</h2>
        {!showForm && !editingReview && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + 회고 추가
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && <ReviewForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {/* Edit form */}
      {editingReview && (
        <ReviewForm
          defaultValues={{
            date: editingReview.date ?? '',
            total_score: editingReview.total_score ?? 3,
            taste: editingReview.taste ?? 3,
            storability: editingReview.storability ?? 3,
            recipe_simplicity: editingReview.recipe_simplicity ?? 3,
            ingredient_availability: editingReview.ingredient_availability ?? 3,
            texture: editingReview.texture ?? 3,
            comment: editingReview.comment ?? '',
            storage_memo: editingReview.storage_memo ?? '',
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Review cards */}
      {reviews.length === 0 && !showForm ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center dark:bg-muted/10">
          <NotebookPen size={32} className="text-muted-foreground opacity-40" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            아직 회고가 없어요. 첫 회고를 작성해보세요!
          </p>
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            + 회고 추가
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회고 삭제</DialogTitle>
            <DialogDescription>
              이 회고를 삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
