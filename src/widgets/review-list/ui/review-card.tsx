import type { Review } from '@/entities/review'
import { CupcakeScore, RadarChart } from '@/shared/ui'
import type { RadarDataPoint } from '@/shared/ui'

interface Props {
  review: Review
  onEdit: (review: Review) => void
  onDelete: (id: string) => void
}

export function ReviewCard({ review, onEdit, onDelete }: Props) {
  const radarData: RadarDataPoint[] = [
    { axis: '맛', value: review.taste ?? 0 },
    { axis: '보관', value: review.storability ?? 0 },
    { axis: '간편성', value: review.recipe_simplicity ?? 0 },
    { axis: '재료수급', value: review.ingredient_availability ?? 0 },
    { axis: '식감', value: review.texture ?? 0 },
  ]

  return (
    <div className="p-4 space-y-3 bg-card border border-border rounded-xl shadow-(--shadow-card)">
      {/* Header: date + score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {review.date ?? review.created_at.split('T')[0]}
        </span>
        {review.total_score != null && <CupcakeScore value={review.total_score} size="sm" />}
      </div>

      {/* Radar chart */}
      <RadarChart data={radarData} size={220} />

      {/* Comment */}
      {review.comment && (
        <p className="text-sm/relaxed text-foreground whitespace-pre-wrap">{review.comment}</p>
      )}

      {/* Storage memo */}
      {review.storage_memo && (
        <p className="text-sm italic text-muted-foreground">보관: {review.storage_memo}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => onEdit(review)}
          className="text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground transition-opacity"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(review.id)}
          className="text-xs px-3 py-1 rounded-lg bg-destructive text-primary-foreground opacity-80"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
