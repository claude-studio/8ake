import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchRecipes, PAGE_SIZE } from './recipe-api'

import type { Recipe, RecipePhoto } from '../model/types'

interface RecipeRow extends Recipe {
  recipe_photos: RecipePhoto[]
}

export function useRecipes(search: string, sortBy: 'created_at' | 'total_score') {
  const [items, setItems] = useState<RecipeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const cursorRef = useRef<{ created_at: string; id: string } | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (reset: boolean) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      if (reset) {
        setIsLoading(true)
        cursorRef.current = undefined
      } else {
        setIsFetchingMore(true)
      }

      try {
        const data = await fetchRecipes({
          search,
          sortBy,
          cursor: reset ? undefined : cursorRef.current,
        })
        const rows = data as unknown as RecipeRow[]
        setHasNextPage(rows.length === PAGE_SIZE)
        if (rows.length > 0) {
          const last = rows[rows.length - 1]
          cursorRef.current = { created_at: last.created_at, id: last.id }
        }
        setItems((prev) => (reset ? rows : [...prev, ...rows]))
      } catch {
        // aborted
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    },
    [search, sortBy]
  )

  useEffect(() => {
    load(true)
  }, [load])

  // Refetch on window focus or explicit recipe-updated event
  useEffect(() => {
    function handleRefetch() {
      load(true)
    }
    window.addEventListener('focus', handleRefetch)
    window.addEventListener('recipe-updated', handleRefetch)
    return () => {
      window.removeEventListener('focus', handleRefetch)
      window.removeEventListener('recipe-updated', handleRefetch)
    }
  }, [load])

  const fetchMore = useCallback(() => {
    if (!isFetchingMore && hasNextPage) load(false)
  }, [isFetchingMore, hasNextPage, load])

  const refetch = useCallback(() => load(true), [load])

  return { items, isLoading, isFetchingMore, hasNextPage, fetchMore, refetch }
}
