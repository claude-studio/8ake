import { Link } from '@tanstack/react-router'

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1024px] items-center justify-between px-5">
        <Link to="/" className="flex items-baseline gap-1.5 no-underline">
          <span className="text-xl font-extrabold leading-none tracking-[-0.04em] text-primary">
            8ake
          </span>
          <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-muted-foreground">
            BAKING NOTEBOOK
          </span>
        </Link>

        <Link
          to="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          로그인
        </Link>
      </div>
    </header>
  )
}
