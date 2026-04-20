import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock useRecipes before importing RecipeGrid
const useRecipesMock = vi.fn()
vi.mock('@/entities/recipe', () => ({
  useRecipes: useRecipesMock,
}))

vi.mock('@/entities/tag', () => ({
  usePopularTags: () => ({ data: [], isLoading: false }),
}))

vi.mock('@/shared/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: () => ({ current: null }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const defaultUseRecipes = {
  items: [],
  isLoading: false,
  isError: false,
  isFetchingMore: false,
  hasNextPage: false,
  fetchMore: vi.fn(),
  refetch: vi.fn(),
}

describe('RecipeGrid', () => {
  it('로딩 중일 때 스켈레톤을 렌더링한다', async () => {
    useRecipesMock.mockReturnValue({ ...defaultUseRecipes, isLoading: true })
    const { RecipeGrid } = await import('../recipe-grid')
    const { container } = render(<RecipeGrid />)
    // 스켈레톤은 animate-pulse 클래스를 가진다
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('에러 상태일 때 에러 메시지를 렌더링한다', async () => {
    useRecipesMock.mockReturnValue({ ...defaultUseRecipes, isError: true })
    const { RecipeGrid } = await import('../recipe-grid')
    render(<RecipeGrid />)
    expect(screen.getByText('레시피를 불러오지 못했어요')).toBeInTheDocument()
  })

  it('아이템이 없을 때 빈 상태 메시지를 렌더링한다', async () => {
    useRecipesMock.mockReturnValue({ ...defaultUseRecipes })
    const { RecipeGrid } = await import('../recipe-grid')
    render(<RecipeGrid />)
    expect(screen.getByText('아직 기록이 없어요')).toBeInTheDocument()
  })

  it('아이템이 있을 때 레시피 카드를 렌더링한다', async () => {
    const mockItems = [
      {
        id: '1',
        name: '소금빵',
        created_at: '2026-01-01T00:00:00Z',
        tags: [],
        source_type: 'etc',
        total_score: null,
        recipe_photos: [],
      },
      {
        id: '2',
        name: '초코케이크',
        created_at: '2026-01-02T00:00:00Z',
        tags: ['초코'],
        source_type: 'blog',
        total_score: 4.5,
        recipe_photos: [],
      },
    ]
    useRecipesMock.mockReturnValue({ ...defaultUseRecipes, items: mockItems })
    const { RecipeGrid } = await import('../recipe-grid')
    render(<RecipeGrid />)
    expect(screen.getAllByText('소금빵').length).toBeGreaterThan(0)
    expect(screen.getAllByText('초코케이크').length).toBeGreaterThan(0)
    // "N개의 레시피" 텍스트는 span으로 분리되어 있어 p 태그 직접 조회
    expect(
      screen.getAllByText(
        (_, el) => el?.tagName === 'P' && (el?.textContent?.includes('개의 레시피') ?? false)
      ).length
    ).toBeGreaterThan(0)
  })

  it('검색 결과가 없을 때 필터 초기화 버튼을 렌더링한다', async () => {
    useRecipesMock.mockReturnValue({ ...defaultUseRecipes })
    const { RecipeGrid } = await import('../recipe-grid')
    // initialTag가 있으면 selectedTags가 있어서 hasFilters=true이지만
    // debouncedSearch는 빈 문자열이므로 검색 결과 없음 상태는 아이템=0 + hasFilters=true여야 함
    // initialTag prop을 사용해 selectedTags 초기값 설정
    render(<RecipeGrid initialTag="베이글" />)
    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument()
    expect(screen.getByText('필터 초기화')).toBeInTheDocument()
  })
})
