import { useMemo } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchRecipes, PAGE_SIZE, recipeKeys } from './recipe-api'

import type { Recipe, RecipePhoto } from '../model/types'

interface RecipeRow extends Recipe {
  recipe_photos: RecipePhoto[]
}

export function useRecipes(search: string, sortBy: 'created_at' | 'total_score') {
  const query = useInfiniteQuery({
    queryKey: recipeKeys.list(search, sortBy),
    queryFn: ({ pageParam }) =>
      fetchRecipes({
        search,
        sortBy,
        cursor: pageParam,
      }),
    initialPageParam: undefined as { created_at: string; id: string } | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      const last = lastPage[lastPage.length - 1]
      return { created_at: last.created_at, id: last.id }
    },
  })

  const items = useMemo(
    () => (query.data?.pages.flat() ?? []) as unknown as RecipeRow[],
    [query.data]
  )

  return {
    items,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchMore: () => {
      if (!query.isFetchingNextPage && query.hasNextPage) {
        query.fetchNextPage()
      }
    },
    refetch: query.refetch,
  }
}
