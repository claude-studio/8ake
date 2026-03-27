import { useCallback, useEffect, useState } from 'react'

import { fetchIngredientReviews } from './ingredient-api'

import type { IngredientReview } from '../model/types'

export function useIngredientReviews(ingredientId: string) {
  const [data, setData] = useState<IngredientReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    if (!ingredientId) return
    fetchIngredientReviews(ingredientId)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [ingredientId])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, refetch: load }
}
