import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createIngredientReview,
  updateIngredientReview,
  deleteIngredientReview,
  deleteIngredient,
  updateIngredientPrice,
  ingredientKeys,
  useIngredientReviews,
} from '@/entities/ingredient'
import { useAuthStore } from '@/features/auth'

import type { IngredientReviewFormValues } from './ingredient-review-schema'

export function useIngredientCrud(ingredientId: string, onIngredientDeleted: () => void) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteIngredientOpen, setDeleteIngredientOpen] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const { data: reviews, isLoading } = useIngredientReviews(ingredientId)
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

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
    queryClient.invalidateQueries({ queryKey: ingredientKeys.reviews(ingredientId) })
  }

  async function handleUpdateReview(id: string, values: IngredientReviewFormValues) {
    await updateIngredientReview(id, {
      score: values.score,
      purchase_place: values.purchase_place || null,
      memo: values.memo || null,
    })
    toast.success('리뷰가 수정되었습니다')
    setEditingId(null)
    queryClient.invalidateQueries({ queryKey: ingredientKeys.reviews(ingredientId) })
  }

  async function handleDeleteReview() {
    if (!deletingReviewId) return
    await deleteIngredientReview(deletingReviewId)
    toast.success('리뷰가 삭제되었습니다')
    setDeletingReviewId(null)
    queryClient.invalidateQueries({ queryKey: ingredientKeys.reviews(ingredientId) })
  }

  async function handleUpdatePrice(unitPrice: number | null, priceUnit: string | null) {
    await updateIngredientPrice(ingredientId, unitPrice, priceUnit)
    toast.success('가격이 수정되었습니다')
    queryClient.invalidateQueries({ queryKey: ingredientKeys.list() })
  }

  async function handleDeleteIngredient() {
    await deleteIngredient(ingredientId)
    toast.success('재료가 삭제되었습니다')
    setDeleteIngredientOpen(false)
    queryClient.invalidateQueries({ queryKey: ingredientKeys.list() })
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
    handleUpdatePrice,
    handleDeleteIngredient,
  }
}
