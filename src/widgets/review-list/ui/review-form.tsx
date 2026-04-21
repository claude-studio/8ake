import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/lib/utils'
import { ScorePicker } from '@/shared/ui'

import { ReviewSchema, type ReviewFormValues } from '../model/review-schema'

interface Props {
  defaultValues?: Partial<ReviewFormValues>
  onSubmit: (values: ReviewFormValues) => Promise<void>
  onCancel?: () => void
}

const SCORE_FIELDS = [
  { name: 'taste' as const, label: '맛' },
  { name: 'storability' as const, label: '보관' },
  { name: 'recipe_simplicity' as const, label: '간편성' },
  { name: 'ingredient_availability' as const, label: '재료수급' },
  { name: 'texture' as const, label: '식감' },
]

export function ReviewForm({ defaultValues, onSubmit, onCancel }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      total_score: 3,
      taste: 3,
      storability: 3,
      recipe_simplicity: 3,
      ingredient_availability: 3,
      texture: 3,
      ...defaultValues,
    },
  })

  const dateStr = useWatch({ control, name: 'date' })
  const dateValue = dateStr ? new Date(dateStr) : undefined
  const [calOpen, setCalOpen] = useState(false)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-border bg-card p-4 shadow-(--shadow-card)"
    >
      {/* Date */}
      <div className="space-y-1.5">
        <label htmlFor="review-date" className="text-sm font-medium text-foreground">
          날짜
        </label>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <button
              id="review-date"
              type="button"
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-sm transition-colors',
                !dateValue && 'text-muted-foreground'
              )}
            >
              {dateValue ? format(dateValue, 'yyyy년 M월 d일 (eee)', { locale: ko }) : '날짜 선택'}
              <CalendarIcon size={15} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(d) => {
                if (d) {
                  setValue('date', d.toISOString().split('T')[0])
                  setCalOpen(false)
                }
              }}
              locale={ko}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {/* Total score */}
      <div className="space-y-1.5">
        <label id="total-score-label" className="text-sm font-medium text-foreground">
          총점
        </label>
        <Controller
          name="total_score"
          control={control}
          render={({ field }) => (
            <ScorePicker
              value={field.value}
              onChange={field.onChange}
              aria-labelledby="total-score-label"
            />
          )}
        />
        {errors.total_score && (
          <p className="text-xs text-destructive">{errors.total_score.message}</p>
        )}
      </div>

      {/* 5-axis scores */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">세부 점수</p>
        {SCORE_FIELDS.map(({ name, label }) => (
          <div key={name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <ScorePicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
            {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
          </div>
        ))}
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
          코멘트
        </label>
        <Textarea
          {...register('comment')}
          id="review-comment"
          rows={3}
          className="resize-none text-sm"
          placeholder="맛, 개선점, 다음에 시도할 것..."
        />
      </div>

      {/* Storage memo */}
      <div className="space-y-1.5">
        <label htmlFor="review-storage-memo" className="text-sm font-medium text-foreground">
          보관 메모
        </label>
        <Textarea
          {...register('storage_memo')}
          id="review-storage-memo"
          rows={2}
          className="resize-none text-sm"
          placeholder="보관 방법, 유통기한..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || (!!defaultValues && !isDirty)}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}
