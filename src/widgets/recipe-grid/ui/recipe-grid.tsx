import { useState } from 'react'

import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useRecipes } from '@/entities/recipe'
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer'

import { RecipeCard } from './recipe-card'
import { RecipeSearchBar } from './recipe-search-bar'

export function RecipeGrid() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'total_score'>('created_at')

  const { items, isLoading, isFetchingMore, hasNextPage, fetchMore } = useRecipes(search, sortBy)

  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingMore) {
      fetchMore()
    }
  })

  return (
    <div className="py-6">
      <RecipeSearchBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 min-[475px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-surface aspect-3/4" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex min-h-[calc(100dvh-var(--header-h)-var(--tabbar-h)-var(--safe-bottom)-5rem)] flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            아직 레시피가 없어요. 첫 레시피를 추가해보세요!
          </p>
          <Button asChild>
            <Link to="/recipe/new">
              <Plus size={16} />
              레시피 추가
            </Link>
          </Button>
        </div>
      )}

      {/* Recipe count */}
      {!isLoading && items.length > 0 && (
        <p className="text-xs tracking-wide font-medium text-muted-foreground mb-3.5 mt-4 pl-0.5">
          <span className="font-bold text-primary">{items.length}</span>
          개의 레시피
        </p>
      )}

      {/* Card grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 min-[475px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              tags={recipe.tags}
              totalScore={null}
              sourceType={recipe.source_type}
              createdAt={recipe.created_at}
              photos={recipe.recipe_photos}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className="h-10 mt-4">
          {isFetchingMore && (
            <div className="flex justify-center">
              <div className="size-6 rounded-full border-2 animate-spin border-border border-t-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
