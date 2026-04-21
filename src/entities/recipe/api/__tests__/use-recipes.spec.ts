import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createQueryClientWrapper } from '@/shared/test-utils/query-wrapper'

import { useRecipes } from '../use-recipes'

vi.mock('@/shared/api', () => ({
  supabase: {},
}))

const { mockFetchRecipes } = vi.hoisted(() => ({
  mockFetchRecipes: vi.fn(),
}))

vi.mock('../recipe-api', () => ({
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
  fetchRecipes: mockFetchRecipes,
}))

type MockRecipeRow = {
  id: string
  name: string
  created_at: string
  total_score: number | null
  recipe_photos: unknown[]
}

describe('useRecipes', () => {
  it('데이터 로딩 완료 후 items 반환', async () => {
    const mockRecipes: MockRecipeRow[] = [
      {
        id: '1',
        name: '마들렌',
        created_at: '2024-01-01T00:00:00Z',
        total_score: 4.5,
        recipe_photos: [],
      },
    ]
    mockFetchRecipes.mockResolvedValue(mockRecipes)

    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].name).toBe('마들렌')
  })

  it('초기 로딩 상태', () => {
    mockFetchRecipes.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.items).toHaveLength(0)
  })

  it('에러 발생 시 isError=true', async () => {
    mockFetchRecipes.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.items).toHaveLength(0)
  })

  it('PAGE_SIZE보다 적은 데이터 → hasNextPage=false', async () => {
    const mockRecipes: MockRecipeRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      name: `레시피 ${i}`,
      created_at: '2024-01-01T00:00:00Z',
      total_score: null,
      recipe_photos: [],
    }))
    mockFetchRecipes.mockResolvedValue(mockRecipes)

    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('PAGE_SIZE(12)와 동일한 데이터 → hasNextPage=true', async () => {
    const mockRecipes: MockRecipeRow[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `레시피 ${i}`,
      created_at: '2024-01-01T00:00:00Z',
      total_score: null,
      recipe_photos: [],
    }))
    mockFetchRecipes.mockResolvedValue(mockRecipes)

    const { result } = renderHook(() => useRecipes('', 'created_at'), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasNextPage).toBe(true)
  })
})
