import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { commentSchema, type CommentFormValues } from '../model/comment-schema'

interface Props {
  defaultValues?: CommentFormValues
  onSubmit: (values: CommentFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CommentForm({ defaultValues, onSubmit, onCancel, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: defaultValues ?? { content: '' },
  })

  const content = useWatch({ control, name: 'content' }) ?? ''

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="relative">
        <textarea
          {...register('content')}
          placeholder="여기에 댓글을 남겨보세요…"
          rows={3}
          aria-label="댓글 내용"
          aria-describedby={errors.content ? 'comment-error' : undefined}
          className="w-full resize-none bg-transparent text-sm/relaxed outline-none placeholder:opacity-40 py-2"
          style={{
            color: 'var(--foreground)',
            borderBottom: '1.5px solid var(--primary-border)',
            caretColor: 'var(--primary)',
          }}
        />
        <span
          className="absolute bottom-2 right-0 text-[11px] tabular-nums"
          style={{ color: 'var(--muted-foreground)', opacity: content.length > 450 ? 1 : 0.4 }}
        >
          {content.length}/500
        </span>
      </div>

      {errors.content && (
        <p id="comment-error" className="text-xs" style={{ color: 'var(--destructive)' }}>
          {errors.content.message}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs font-medium transition-opacity disabled:opacity-40"
          style={{ color: 'var(--muted-foreground)' }}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-xs font-semibold transition-opacity disabled:opacity-40"
          style={{ color: 'var(--primary)' }}
        >
          {isSubmitting ? '저장 중…' : '저장'}
        </button>
      </div>
    </form>
  )
}
