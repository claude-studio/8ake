import React from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  useRouter: vi.fn(),
}))

vi.mock('@/entities/recipe', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/shared/hooks/use-debounced-value', () => ({
  useDebouncedValue: (v: unknown) => v,
}))

vi.mock('@/shared/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: () => ({ current: null }),
}))

vi.mock('../recipe-search-bar', () => ({
  RecipeSearchBar: () => React.createElement('div', { 'data-testid': 'search-bar' }),
}))

vi.mock('../tag-filter-bar', () => ({
  TagFilterBar: () => React.createElement('div', { 'data-testid': 'tag-filter' }),
}))

vi.mock('../recipe-card', () => ({
  RecipeCard: ({ name }: { name: string }) =>
    React.createElement('div', { 'data-testid': 'recipe-card' }, name),
  rotations: [0, 1, 2, 3, 4, 5],
}))

import { useRecipes } from '@/entities/recipe'

import { RecipeGrid } from '../recipe-grid'

const mockUseRecipes = vi.mocked(useRecipes)

function baseRecipeState() {
  return {
    items: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    isFetchingMore: false,
    hasNextPage: false,
    fetchMore: vi.fn(),
    refetch: vi.fn(),
  }
}

describe('RecipeGrid', () => {
  it('로딩 상태 시 스켈레톤 렌더링', () => {
    mockUseRecipes.mockReturnValue({ ...baseRecipeState(), isLoading: true })

    const { container } = render(React.createElement(RecipeGrid))
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('빈 상태(데이터 없음) 시 안내 텍스트 렌더링', () => {
    mockUseRecipes.mockReturnValue(baseRecipeState())

    render(React.createElement(RecipeGrid))
    expect(screen.getByText('아직 기록이 없어요')).toBeTruthy()
  })

  it('에러 상태 시 에러 메시지 렌더링', () => {
    mockUseRecipes.mockReturnValue({ ...baseRecipeState(), isError: true })

    render(React.createElement(RecipeGrid))
    expect(screen.getByText('레시피를 불러오지 못했어요')).toBeTruthy()
  })

  it('아이템 있을 시 RecipeCard 렌더링', () => {
    mockUseRecipes.mockReturnValue({
      ...baseRecipeState(),
      items: [
        {
          id: '1',
          name: '초코 쿠키',
          tags: [],
          total_score: null,
          source_type: 'etc',
          created_at: '2024-01-01T00:00:00Z',
          recipe_photos: [],
          is_public: true,
          bake_time: null,
          memo: null,
          oven_temp: null,
          preheat_temp: null,
          preheat_time: null,
          quantity: null,
          recipe_text: '',
          source_url: null,
          thumbnail_photo_id: null,
          user_id: 'test-user',
        },
      ] as unknown as ReturnType<typeof useRecipes>['items'],
    })

    render(React.createElement(RecipeGrid))
    expect(screen.getByTestId('recipe-card')).toBeTruthy()
    expect(screen.getByText('초코 쿠키')).toBeTruthy()
  })
})
