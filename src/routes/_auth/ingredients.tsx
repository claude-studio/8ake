import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/ingredients')({
  component: () => <div>재료 리뷰 (구현 예정)</div>,
})
