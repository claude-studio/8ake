import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api', () => ({
  supabase: {},
}))

vi.mock('../recipe-api', () => ({
  fetchRecipes: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: '초코 쿠키',
      created_at: '2024-01-01T00:00:00Z',
      source_type: 'youtube',
      tags: ['쿠키'],
      recipe_photos: [],
      total_score: 4,
    },
  ]),
  recipeKeys: {
    all: ['recipes'],
    lists: () => ['recipes', 'list'],
    list: (search: string, sortBy: string, tags?: string[]) => [
      'recipes',
      'list',
      { search, sortBy, tags },
    ],
  },
  PAGE_SIZE: 12,
}))

import { useRecipes } from '../use-recipes'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useRecipes', () => {
  it('초기 로딩 상태 반환', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useRecipes('', 'created_at'), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('데이터 로드 후 items 반환', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useRecipes('', 'created_at'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('초코 쿠키')
  })

  it('페이지 크기보다 적은 결과 시 hasNextPage false', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useRecipes('', 'created_at'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasNextPage).toBe(false)
  })

  it('isError, refetch, fetchMore, isFetchingMore 필드 존재', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useRecipes('', 'created_at'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(typeof result.current.isError).toBe('boolean')
    expect(typeof result.current.refetch).toBe('function')
    expect(typeof result.current.fetchMore).toBe('function')
    expect(typeof result.current.isFetchingMore).toBe('boolean')
  })
})
