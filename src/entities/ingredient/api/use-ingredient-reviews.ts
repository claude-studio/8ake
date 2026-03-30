import { useQuery } from '@tanstack/react-query'

import { fetchIngredientReviews, ingredientKeys } from './ingredient-api'

export function useIngredientReviews(ingredientId: string) {
  const query = useQuery({
    queryKey: ingredientKeys.reviews(ingredientId),
    queryFn: () => fetchIngredientReviews(ingredientId),
    enabled: !!ingredientId,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
