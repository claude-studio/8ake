import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/recipe/$id')({
  component: () => <div>레시피 상세 (구현 예정)</div>,
})
