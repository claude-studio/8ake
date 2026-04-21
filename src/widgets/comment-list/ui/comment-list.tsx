import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
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
import {
  commentKeys,
  createComment,
  updateComment,
  deleteComment,
  useInfiniteComments,
  useCommentsCount,
} from '@/entities/comment'
import { useAuthStore } from '@/features/auth'

import { CommentCard } from './comment-card'
import { CommentForm } from './comment-form'

import type { CommentFormValues } from '../model/comment-schema'

interface Props {
  recipeId: string
  isPublic: boolean
}

export function CommentList({ recipeId, isPublic }: Props) {
  const user = useAuthStore((s) => s.user)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteComments(recipeId, isPublic)
  const { data: totalCount = 0 } = useCommentsCount(recipeId, isPublic)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isPublic) return null

  const comments = data?.pages.flatMap((page) => page.comments) ?? []

  const invalidateComments = () => {
    queryClient.invalidateQueries({ queryKey: commentKeys.infinite(recipeId) })
    queryClient.invalidateQueries({ queryKey: commentKeys.count(recipeId) })
  }

  const handleCreate = async (values: CommentFormValues) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await createComment({ ...values, recipe_id: recipeId, user_id: user.id })
      toast.success('댓글이 추가되었습니다.')
      setShowForm(false)
      invalidateComments()
    } catch {
      toast.error('댓글 추가에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (id: string, values: CommentFormValues) => {
    try {
      await updateComment(id, values)
      toast.success('댓글이 수정되었습니다.')
      invalidateComments()
    } catch (err) {
      toast.error('댓글 수정에 실패했습니다.')
      throw err
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await deleteComment(deletingId)
      toast.success('댓글이 삭제되었습니다.')
      setDeletingId(null)
      invalidateComments()
    } catch {
      toast.error('댓글 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div
        className="flex items-baseline justify-between pb-3 mb-1"
        style={{ borderBottom: '1.5px solid var(--border)' }}
      >
        <h2
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}
        >
          댓글
          {totalCount > 0 && (
            <span className="ml-2 font-normal" style={{ color: 'var(--primary)', opacity: 0.8 }}>
              {totalCount}
            </span>
          )}
        </h2>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            + 댓글 추가
          </button>
        )}
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <div className="pt-2 pb-1">
          <CommentForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* 목록 */}
      {isLoading ? (
        <div
          className="py-8 text-center text-xs"
          style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}
        >
          불러오는 중…
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-xs" style={{ color: 'var(--destructive)' }}>
            {error instanceof Error ? error.message : '불러오지 못했습니다.'}
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs underline underline-offset-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            다시 시도
          </button>
        </div>
      ) : comments.length === 0 && !showForm ? (
        <div
          className="py-10 text-center text-xs"
          style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}
        >
          {user ? '첫 댓글을 남겨보세요.' : '로그인하면 댓글을 남길 수 있어요.'}
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onUpdate={handleUpdate}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
          {hasNextPage && (
            <div className="pt-3 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-xs transition-opacity disabled:opacity-40 hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중…' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
