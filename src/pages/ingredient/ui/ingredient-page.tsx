import { IngredientList } from '@/widgets/ingredient-list'

export function IngredientPage() {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1024px] items-center px-5">
          <span className="text-[15px] font-bold text-foreground">재료 관리</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1024px] px-4 pb-20 pt-5">
        <IngredientList />
      </div>
    </div>
  )
}
