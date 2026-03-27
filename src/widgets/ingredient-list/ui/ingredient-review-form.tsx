import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { ScorePicker } from '@/shared/ui'

import {
  IngredientReviewSchema,
  type IngredientReviewFormValues,
} from '../model/ingredient-review-schema'

interface Props {
  onSubmit: (values: IngredientReviewFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<IngredientReviewFormValues>
}

export function IngredientReviewForm({ onSubmit, onCancel, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IngredientReviewFormValues>({
    resolver: zodResolver(IngredientReviewSchema),
    defaultValues: {
      purchase_place: defaultValues?.purchase_place ?? '',
      score: defaultValues?.score ?? 3,
      memo: defaultValues?.memo ?? '',
    },
  })

  const score = useWatch({ control, name: 'score' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">구매처</label>
        <input
          {...register('purchase_place')}
          placeholder="예: 이마트, 쿠팡"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-offset-1"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">점수</label>
        <ScorePicker value={score} onChange={(v) => setValue('score', v)} />
        {errors.score && <span className="text-xs text-destructive">{errors.score.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">메모</label>
        <textarea
          {...register('memo')}
          rows={3}
          placeholder="맛, 품질, 특이사항 등"
          className="resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-offset-1"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:opacity-80"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (!!defaultValues && !isDirty)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}
