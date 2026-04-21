import { useQuery } from '@tanstack/react-query'

import { commentKeys, fetchComments } from './comment-api'

export function useComments(recipeId: string) {
  return useQuery({
    queryKey: commentKeys.list(recipeId),
    queryFn: () => fetchComments(recipeId),
  })
}
