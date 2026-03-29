import { HeaderMenu } from '@/widgets/header-menu'
import { IngredientList } from '@/widgets/ingredient-list'

export function IngredientPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1024px] items-center justify-between px-5">
          <span className="text-[15px] font-bold text-foreground">재료 관리</span>
          <HeaderMenu />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1024px] px-4 pb-20 pt-5">
        <IngredientList />
      </div>
    </div>
  )
}
