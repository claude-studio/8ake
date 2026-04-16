import { Link } from '@tanstack/react-router'

import { useAuthStore } from '@/features/auth'

export function LandingNav() {
  const session = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1024px] items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-baseline gap-1.5 no-underline">
          <span className="font-display text-xl font-bold italic leading-none tracking-[-0.02em] text-primary">
            8ake
          </span>
          <span className="text-[0.55rem] font-semibold tracking-[0.16em] text-muted-foreground/70 uppercase">
            Baking Notebook
          </span>
        </Link>

        {!isLoading &&
          (session ? (
            <Link
              to="/home"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              앱 열기
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              로그인
            </Link>
          ))}
      </div>
    </header>
  )
}
