import { useQuery } from '@tanstack/react-query'

import { fetchReviews, reviewKeys } from './review-api'

export function useReviews(recipeId: string) {
  const query = useQuery({
    queryKey: reviewKeys.list(recipeId),
    queryFn: () => fetchReviews(recipeId),
    enabled: !!recipeId,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
