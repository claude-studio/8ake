import { useEffect, useState } from 'react'

import { fetchRecipe } from './recipe-api'

import type { RecipeWithDetails } from '../model/types'

export function useRecipe(id: string) {
  const [data, setData] = useState<RecipeWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchRecipe(id)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return { data, isLoading, error }
}
