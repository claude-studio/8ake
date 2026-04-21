import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: defaultValues ?? { content: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...register('content')}
        placeholder="댓글을 입력하세요 (최대 500자)"
        rows={3}
        className="resize-none"
        aria-label="댓글 내용"
        aria-describedby={errors.content ? 'comment-error' : undefined}
      />
      {errors.content && (
        <p id="comment-error" className="text-xs text-destructive">
          {errors.content.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}
