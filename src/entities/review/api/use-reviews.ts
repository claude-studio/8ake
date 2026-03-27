import { useCallback, useEffect, useState } from 'react'

import { fetchReviews } from './review-api'

import type { Review } from '../model/types'

export function useReviews(recipeId: string) {
  const [data, setData] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    fetchReviews(recipeId)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [recipeId])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, refetch: load }
}
