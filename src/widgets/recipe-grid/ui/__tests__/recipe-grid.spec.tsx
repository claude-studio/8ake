import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRecipes } from '@/entities/recipe'
import { createQueryClientWrapper } from '@/shared/test-utils/query-wrapper'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

vi.mock('@/shared/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: () => ({ current: null }),
}))

vi.mock('@/entities/recipe', () => ({
  useRecipes: vi.fn(),
}))

vi.mock('@/widgets/recipe-grid/ui/recipe-search-bar', () => ({
  RecipeSearchBar: () => <div data-testid="recipe-search-bar" />,
}))

vi.mock('@/widgets/recipe-grid/ui/tag-filter-bar', () => ({
  TagFilterBar: () => <div data-testid="tag-filter-bar" />,
}))

vi.mock('@/widgets/recipe-grid/ui/recipe-card', () => ({
  RecipeCard: ({ name }: { name: string }) => <div data-testid="recipe-card">{name}</div>,
  rotations: [0, 1, -1],
}))

const mockUseRecipes = vi.mocked(useRecipes)

type UseRecipesReturn = ReturnType<typeof useRecipes>

function makeRecipesState(overrides: Partial<UseRecipesReturn>): UseRecipesReturn {
  return {
    items: [],
    isLoading: false,
    isError: false,
    isFetchingMore: false,
    hasNextPage: false,
    fetchMore: vi.fn(),
    refetch: vi.fn() as UseRecipesReturn['refetch'],
    ...overrides,
  }
}

function renderRecipeGrid(initialTag?: string) {
  const Wrapper = createQueryClientWrapper()
  return render(
    <Wrapper>
      <RecipeGrid initialTag={initialTag} />
    </Wrapper>
  )
}

import { RecipeGrid } from '../recipe-grid'

describe('RecipeGrid', () => {
  it('loading state — skeleton 6개 렌더링', () => {
    mockUseRecipes.mockReturnValue(makeRecipesState({ isLoading: true }))

    const { container } = renderRecipeGrid()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(6)
  })

  it('empty state — 아직 기록이 없어요 메시지 표시', () => {
    mockUseRecipes.mockReturnValue(makeRecipesState({}))

    renderRecipeGrid()

    expect(screen.getByText('아직 기록이 없어요')).toBeInTheDocument()
    expect(screen.getByText('첫 레시피를 아카이브해보세요')).toBeInTheDocument()
  })

  it('error state — 에러 메시지 및 다시 시도 버튼 표시', () => {
    mockUseRecipes.mockReturnValue(makeRecipesState({ isError: true }))

    renderRecipeGrid()

    expect(screen.getByText('레시피를 불러오지 못했어요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument()
  })

  it('데이터 있을 때 RecipeCard 렌더링', () => {
    const items = [
      {
        id: '1',
        name: '마들렌',
        tags: ['디저트'],
        total_score: 4.5,
        source_type: 'youtube',
        created_at: '2024-01-01',
        recipe_photos: [],
      },
      {
        id: '2',
        name: '쿠키',
        tags: [],
        total_score: null,
        source_type: 'blog',
        created_at: '2024-01-02',
        recipe_photos: [],
      },
    ] as UseRecipesReturn['items']

    mockUseRecipes.mockReturnValue(makeRecipesState({ items }))

    renderRecipeGrid()

    const cards = screen.getAllByTestId('recipe-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('마들렌')).toBeInTheDocument()
    expect(screen.getByText('쿠키')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // item count
  })
})
