import { useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import {
  fetchRecipes,
  PAGE_SIZE,
  recipeKeys,
  type RecipeCursor,
  type RecipeListItem,
} from './recipe-api'

export function useRecipes(search: string, sortBy: 'created_at' | 'total_score', tags?: string[]) {
  const query = useInfiniteQuery({
    queryKey: recipeKeys.list(search, sortBy, tags),
    queryFn: ({ pageParam }) =>
      fetchRecipes({
        search,
        sortBy,
        cursor: pageParam,
        tags,
      }),
    initialPageParam: undefined as RecipeCursor | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      const last = lastPage[lastPage.length - 1] as RecipeListItem
      if (sortBy === 'total_score') {
        return { total_score: last.total_score, id: last.id }
      }
      return { created_at: last.created_at, id: last.id }
    },
  })

  const items = useMemo<RecipeListItem[]>(() => query.data?.pages.flat() ?? [], [query.data])

  return {
    items,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchMore: () => {
      if (!query.isFetchingNextPage && query.hasNextPage) {
        query.fetchNextPage()
      }
    },
    isError: query.isError,
    refetch: query.refetch,
  }
}
