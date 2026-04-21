import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { commentKeys, fetchComments, fetchCommentsCount, PAGE_SIZE } from './comment-api'

import type { CommentsPage } from './comment-api'

export function useInfiniteComments(recipeId: string, enabled = true) {
  return useInfiniteQuery<
    CommentsPage,
    Error,
    CommentsPage,
    ReturnType<typeof commentKeys.infinite>,
    { ts: string; id: string } | null
  >({
    queryKey: commentKeys.infinite(recipeId),
    queryFn: ({ pageParam }) => fetchComments({ recipeId, limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor && lastPage.nextCursorId
        ? { ts: lastPage.nextCursor, id: lastPage.nextCursorId }
        : null,
    enabled,
  })
}

export function useCommentsCount(recipeId: string, enabled = true) {
  return useQuery({
    queryKey: commentKeys.count(recipeId),
    queryFn: () => fetchCommentsCount(recipeId),
    enabled,
  })
}
