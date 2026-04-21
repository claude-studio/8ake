import { useQuery } from '@tanstack/react-query'

import { commentKeys, fetchComments } from './comment-api'

export function useComments(recipeId: string, enabled = true) {
  return useQuery({
    queryKey: commentKeys.list(recipeId),
    queryFn: () => fetchComments(recipeId),
    enabled,
  })
}
