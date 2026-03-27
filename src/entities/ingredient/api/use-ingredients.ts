import { useCallback, useEffect, useState } from 'react'

import { fetchIngredients } from './ingredient-api'

import type { Ingredient } from '../model/types'

export function useIngredients() {
  const [data, setData] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    fetchIngredients()
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, refetch: load }
}
