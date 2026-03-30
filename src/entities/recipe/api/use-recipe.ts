import { useQuery } from '@tanstack/react-query'

import { fetchRecipe, recipeKeys } from './recipe-api'

export function useRecipe(id: string) {
  const query = useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
