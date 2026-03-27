import { RecipeGrid } from '@/widgets/recipe-grid'

export function RecipeListPage() {
  const dateStr = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1024px] items-center justify-between px-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[21px] font-extrabold tracking-[-0.05em] text-primary">8ake</span>
            <span className="-rotate-2 rounded px-1 py-px text-[9px] font-bold uppercase tracking-widest text-primary opacity-60 ring-1 ring-(--primary-border)">
              nb
            </span>
          </div>
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {dateStr}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1024px] px-4">
        <RecipeGrid />
      </div>
    </>
  )
}
