import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  title: string
  right?: React.ReactNode
}

export function PageHeader({ title, right }: Props) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1024px] items-center px-2">
        {/* 왼쪽: 뒤로가기 */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => router.history.back()}
          title="뒤로가기"
          className="shrink-0 text-muted-foreground"
        >
          <ArrowLeft size={18} />
        </Button>

        {/* 가운데: 타이틀 */}
        <Link to="/" className="flex flex-1 items-center justify-center gap-1.5 no-underline">
          <span className="text-[15px] font-bold text-foreground">{title}</span>
        </Link>

        {/* 오른쪽 액션 */}
        <div className="flex shrink-0 items-center gap-0.5">{right ?? <div className="w-8" />}</div>
      </div>
    </header>
  )
}
