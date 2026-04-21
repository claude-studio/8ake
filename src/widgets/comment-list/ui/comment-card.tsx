import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { RecipeComment } from '@/entities/comment'
import { useAuthStore } from '@/features/auth'

import { CommentForm } from './comment-form'

import type { CommentFormValues } from '../model/comment-schema'

interface Props {
  comment: RecipeComment
  onUpdate: (id: string, values: CommentFormValues) => Promise<void>
  onDelete: (id: string) => void
}

export function CommentCard({ comment, onUpdate, onDelete }: Props) {
  const user = useAuthStore((s) => s.user)
  const isOwner = !!user && user.id === comment.user_id
  const [editing, setEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: CommentFormValues) => {
    setIsSubmitting(true)
    try {
      await onUpdate(comment.id, values)
      setEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = new Date(comment.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          {comment.author_email && (
            <span className="text-xs font-medium text-foreground">{comment.author_email}</span>
          )}
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        {isOwner && !editing && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setEditing(true)}
            >
              수정
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              삭제
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <CommentForm
          defaultValues={{ content: comment.content }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          isSubmitting={isSubmitting}
        />
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
      )}
    </div>
  )
}
