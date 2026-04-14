import { cn } from '@/shared/lib/utils'

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface', className)} />
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Bone className="aspect-3/4 rounded-none" />
      <div className="p-3 space-y-2">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 min-[475px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {Array.from({ length: 6 }, (_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function RecipeDetailSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero photo */}
      <Bone className="w-full aspect-4/3 rounded-none" />
      {/* Info card */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-(--shadow-card) space-y-3">
          <Bone className="h-7 w-2/3" />
          <Bone className="h-4 w-1/3" />
          <div className="flex gap-2">
            <Bone className="h-5 w-14 rounded-full" />
            <Bone className="h-5 w-14 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[1, 2, 3].map((i) => (
              <Bone key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 mt-5 space-y-4">
        <Bone className="h-32 rounded-xl" />
        <Bone className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

export function IngredientListSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Bone className="h-4 w-1/3" />
            <Bone className="h-6 w-16 rounded-full" />
          </div>
          <Bone className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Bone className="h-72 rounded-2xl" />
      <Bone className="h-48 rounded-2xl" />
    </div>
  )
}
