import { useQuery } from '@tanstack/react-query'

import { fetchIngredients, ingredientKeys } from './ingredient-api'

export function useIngredients() {
  const query = useQuery({
    queryKey: ingredientKeys.list(),
    queryFn: fetchIngredients,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
