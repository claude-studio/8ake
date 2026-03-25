import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/')({
  component: RecipeListPage,
})

function RecipeListPage() {
  return <div>레시피 목록 (구현 예정)</div>
}
