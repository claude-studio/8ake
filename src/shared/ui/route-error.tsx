import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  error?: Error | null
  onReset?: () => void
  showHome?: boolean
}

export function RouteError({ error, onReset, showHome = true }: Props) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle size={26} className="text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-bold text-foreground">문제가 발생했습니다</p>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? '일시적인 오류입니다. 잠시 후 다시 시도해주세요.'}
        </p>
      </div>
      <div className="flex gap-2">
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
            <RotateCcw size={13} />
            다시 시도
          </Button>
        )}
        {showHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/home')}
            className="gap-1.5"
          >
            <Home size={13} />
            홈으로
          </Button>
        )}
      </div>
    </div>
  )
}
