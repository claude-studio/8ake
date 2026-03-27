import { useState } from 'react'

import { ChevronDown, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Ingredient } from '@/entities/ingredient'
import { cn } from '@/shared/lib/utils'
import { CupcakeScore } from '@/shared/ui'

import { IngredientReviewForm } from './ingredient-review-form'
import { useIngredientCrud } from '../model/use-ingredient-crud'

interface Props {
  ingredients: Ingredient[]
  onRefetch: () => void
}

function IngredientCard({
  ingredient,
  onRefetch,
}: {
  ingredient: Ingredient
  onRefetch: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const {
    reviews,
    isLoading,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    deleteIngredientOpen,
    setDeleteIngredientOpen,
    deletingReviewId,
    setDeletingReviewId,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
    handleDeleteIngredient,
  } = useIngredientCrud(ingredient.id, onRefetch)

  const latestReview = reviews[0]

  return (
    <div className="rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">{ingredient.name}</span>
          {latestReview && (
            <div className="flex items-center gap-2">
              <CupcakeScore value={latestReview.score ?? 0} size="sm" />
              {latestReview.purchase_place && (
                <span className="text-xs text-muted-foreground">{latestReview.purchase_place}</span>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn('text-muted-foreground transition-transform duration-200', {
            'rotate-180': expanded,
          })}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">리뷰 ({reviews.length})</span>
            <div className="flex gap-2">
              <Button
                size="xs"
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                }}
              >
                + 리뷰 추가
              </Button>
              <Button
                size="icon-xs"
                variant="outline"
                onClick={() => setDeleteIngredientOpen(true)}
                aria-label="재료 삭제"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="mb-4 rounded-lg border border-border p-3">
              <IngredientReviewForm
                onSubmit={handleCreateReview}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 리뷰가 없습니다</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) =>
                editingId === review.id ? (
                  <div key={review.id} className="rounded-lg border border-border p-3">
                    <IngredientReviewForm
                      defaultValues={{
                        score: review.score ?? 3,
                        purchase_place: review.purchase_place ?? '',
                        memo: review.memo ?? '',
                      }}
                      onSubmit={(values) => handleUpdateReview(review.id, values)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div
                    key={review.id}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <CupcakeScore value={review.score ?? 0} size="sm" />
                      {review.purchase_place && (
                        <span className="text-xs text-muted-foreground">
                          {review.purchase_place}
                        </span>
                      )}
                      {review.memo && <p className="text-sm text-foreground">{review.memo}</p>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="xs" variant="ghost" onClick={() => setEditingId(review.id)}>
                        수정
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setDeletingReviewId(review.id)}
                        className="text-muted-foreground"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={deleteIngredientOpen} onOpenChange={setDeleteIngredientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>재료 삭제</DialogTitle>
            <DialogDescription>
              "{ingredient.name}" 재료를 삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIngredientOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteIngredient}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingReviewId} onOpenChange={(open) => !open && setDeletingReviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 삭제</DialogTitle>
            <DialogDescription>
              이 리뷰를 삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingReviewId(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function IngredientCardView({ ingredients, onRefetch }: Props) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} onRefetch={onRefetch} />
      ))}
    </div>
  )
}
