import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/recipe/$id_/edit')({
  component: () => <div>레시피 수정 (구현 예정)</div>,
})
