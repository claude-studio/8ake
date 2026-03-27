import { useState } from 'react'

import { toast } from 'sonner'

import {
  createIngredientReview,
  updateIngredientReview,
  deleteIngredientReview,
  deleteIngredient,
  useIngredientReviews,
} from '@/entities/ingredient'
import { useAuthStore } from '@/features/auth'

import type { IngredientReviewFormValues } from './ingredient-review-schema'

export function useIngredientCrud(ingredientId: string, onIngredientDeleted: () => void) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteIngredientOpen, setDeleteIngredientOpen] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const { data: reviews, isLoading, refetch: refetchReviews } = useIngredientReviews(ingredientId)
  const user = useAuthStore((s) => s.user)

  async function handleCreateReview(values: IngredientReviewFormValues) {
    if (!user) return
    await createIngredientReview({
      ingredient_id: ingredientId,
      user_id: user.id,
      score: values.score,
      purchase_place: values.purchase_place || null,
      memo: values.memo || null,
    })
    toast.success('리뷰가 추가되었습니다')
    setShowForm(false)
    refetchReviews()
  }

  async function handleUpdateReview(id: string, values: IngredientReviewFormValues) {
    await updateIngredientReview(id, {
      score: values.score,
      purchase_place: values.purchase_place || null,
      memo: values.memo || null,
    })
    toast.success('리뷰가 수정되었습니다')
    setEditingId(null)
    refetchReviews()
  }

  async function handleDeleteReview() {
    if (!deletingReviewId) return
    await deleteIngredientReview(deletingReviewId)
    toast.success('리뷰가 삭제되었습니다')
    setDeletingReviewId(null)
    refetchReviews()
  }

  async function handleDeleteIngredient() {
    await deleteIngredient(ingredientId)
    toast.success('재료가 삭제되었습니다')
    setDeleteIngredientOpen(false)
    onIngredientDeleted()
  }

  return {
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
  }
}
