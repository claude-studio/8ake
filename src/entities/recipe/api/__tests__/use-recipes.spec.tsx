import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRecipes } from '../use-recipes'

const fetchRecipesMock = vi.hoisted(() => vi.fn())

vi.mock('../recipe-api', () => ({
  fetchRecipes: fetchRecipesMock,
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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useRecipes', () => {
  beforeEach(() => {
    fetchRecipesMock.mockReset()
  })

  it('초기 로딩 상태를 반환한다', () => {
    fetchRecipesMock.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.items).toEqual([])
  })

  it('성공 시 items를 반환한다', async () => {
    const mockRecipes = [
      {
        id: '1',
        name: '초코케이크',
        created_at: '2026-01-01T00:00:00Z',
        tags: ['초코'],
        source_type: 'etc',
        total_score: null,
        recipe_photos: [],
      },
    ]
    fetchRecipesMock.mockResolvedValue(mockRecipes)
    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('초코케이크')
    expect(result.current.isError).toBe(false)
  })

  it('실패 시 isError가 true가 된다', async () => {
    fetchRecipesMock.mockRejectedValue(new Error('네트워크 오류'))
    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(true)
    expect(result.current.items).toEqual([])
  })

  it('검색어와 태그로 필터링 시 fetchRecipes에 반영된다', async () => {
    fetchRecipesMock.mockResolvedValue([])
    const { result } = renderHook(() => useRecipes('소금빵', 'total_score', ['베이글']), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchRecipesMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: '소금빵', sortBy: 'total_score', tags: ['베이글'] })
    )
  })
})
