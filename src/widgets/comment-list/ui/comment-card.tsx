import { useState } from 'react'

import type { RecipeComment } from '@/entities/comment'
import { useAuthStore } from '@/features/auth'

import { CommentForm } from './comment-form'

import type { CommentFormValues } from '../model/comment-schema'

interface Props {
  comment: RecipeComment
  onUpdate: (id: string, values: CommentFormValues) => Promise<void>
  onDelete: (id: string) => void
}

function getHandle(email: string | null | undefined) {
  if (!email) return '익명'
  return email.split('@')[0]
}

export function CommentCard({ comment, onUpdate, onDelete }: Props) {
  const user = useAuthStore((s) => s.user)
  const isOwner = !!user && user.id === comment.user_id
  const [editing, setEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hovered, setHovered] = useState(false)

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

  if (editing) {
    return (
      <div className="py-3">
        <CommentForm
          defaultValues={{ content: comment.content }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  }

  return (
    <div
      className="group py-3"
      style={{ borderBottom: '1px solid var(--rule)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 상단 메타 */}
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
          {getHandle(comment.author_email)}
        </span>
        <span
          className="text-[11px] tabular-nums shrink-0"
          style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
        >
          {formattedDate}
        </span>
      </div>

      {/* 본문 + 오너 액션 */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm/relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
          {comment.content}
        </p>

        {isOwner && (
          <div
            className="flex gap-2 shrink-0 transition-opacity duration-150 pt-0.5"
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <button
              className="text-[11px] font-medium"
              style={{ color: 'var(--muted-foreground)' }}
              onClick={() => setEditing(true)}
              aria-label="댓글 수정"
            >
              수정
            </button>
            <button
              className="text-[11px] font-medium"
              style={{ color: 'var(--destructive)', opacity: 0.8 }}
              onClick={() => onDelete(comment.id)}
              aria-label="댓글 삭제"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
