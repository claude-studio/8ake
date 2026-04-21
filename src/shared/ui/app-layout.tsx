import { useRef, useState } from 'react'

import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Home, Package, Plus } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface Props {
  children: React.ReactNode
  hideNav?: boolean
}

const springConfig = { duration: 0.25, ease: 'easeInOut' } as const

export function AppLayout({ children, hideNav = false }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipLeft, setTooltipLeft] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path)

  const handleHover = (index: number | null) => {
    setHoveredIndex(index)
    if (index !== null && menuRef.current && tooltipRef.current) {
      const item = menuRef.current.children[index] as HTMLElement
      const menuRect = menuRef.current.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      const ttWidth = tooltipRef.current.getBoundingClientRect().width
      const left = itemRect.left - menuRect.left + (itemRect.width - ttWidth) / 2
      setTooltipLeft(Math.max(0, Math.min(left, menuRect.width - ttWidth)))
    }
  }

  const LABELS = ['레시피', '재료', '캘린더', '새 레시피']

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 스킵 내비게이션 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-9999 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-floating focus:outline-none focus:ring-2 focus:ring-primary"
      >
        본문으로 이동
      </a>

      <main
        id="main-content"
        className={hideNav ? '' : 'pb-[calc(var(--tabbar-h)+var(--safe-bottom))]'}
      >
        {children}
      </main>

      {!hideNav && (
        <nav
          aria-label="주요 메뉴"
          className="fixed bottom-0 inset-x-0  z-50 flex h-[calc(var(--tabbar-h)+var(--safe-bottom))] items-center justify-center"
        >
          {/* 단일 pill — 내비 아이템 + separator + FAB */}
          <div className="relative">
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={springConfig}
                  className="pointer-events-none absolute inset-x-0  -top-8"
                  aria-hidden
                >
                  <motion.div
                    ref={tooltipRef}
                    className="inline-flex h-6 items-center whitespace-nowrap rounded-lg border border-border bg-card/95 px-2.5 text-[11px] font-medium text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-sm"
                    initial={{ x: tooltipLeft }}
                    animate={{ x: tooltipLeft }}
                    transition={springConfig}
                  >
                    {LABELS[hoveredIndex]}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pill container */}
            <div
              ref={menuRef}
              className="inline-flex h-12 items-center gap-1 rounded-full border border-border bg-card/95 px-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_24px_-4px_rgba(0,0,0,0.12)] backdrop-blur-xl"
            >
              {/* 레시피 */}
              <PillItem
                as="link"
                to="/home"
                active={isActive('/home', true)}
                aria-label="레시피"
                onHover={(v) => handleHover(v ? 0 : null)}
              >
                <Home size={18} />
              </PillItem>

              {/* 재료 */}
              <PillItem
                as="link"
                to="/ingredients"
                active={isActive('/ingredients')}
                aria-label="재료"
                onHover={(v) => handleHover(v ? 1 : null)}
              >
                <Package size={18} />
              </PillItem>

              {/* 캘린더 */}
              <PillItem
                as="link"
                to="/dashboard"
                active={isActive('/dashboard')}
                aria-label="캘린더"
                onHover={(v) => handleHover(v ? 2 : null)}
              >
                <CalendarDays size={18} />
              </PillItem>

              {/* Separator */}
              <div className="mx-1 h-5 w-px bg-border" aria-hidden />

              {/* FAB — pill 내부, primary 배경 */}
              <Link
                to="/recipe/new"
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="새 레시피 추가"
                onMouseEnter={() => handleHover(3)}
                onMouseLeave={() => handleHover(null)}
              >
                <Plus size={18} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}

type PillItemProps =
  | {
      as: 'link'
      to: string
      active: boolean
      'aria-label': string
      onHover: (v: boolean) => void
      children: React.ReactNode
      onClick?: never
    }
  | {
      as: 'button'
      active: boolean
      'aria-label': string
      onHover: (v: boolean) => void
      onClick: () => void
      children: React.ReactNode
      to?: never
    }

function PillItem({
  as,
  to,
  active,
  'aria-label': ariaLabel,
  onHover,
  onClick,
  children,
}: PillItemProps) {
  const cls = cn(
    'flex size-9 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground'
  )

  if (as === 'link') {
    return (
      <Link
        to={to!}
        className={cls}
        aria-label={ariaLabel}
        aria-current={active ? 'page' : undefined}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      aria-label={ariaLabel}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
