import { useCallback, useRef, useState } from 'react'

import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Moon, Package, Plus, Sun } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface Props {
  children: React.ReactNode
  hideNav?: boolean
}

const springConfig = { duration: 0.25, ease: 'easeInOut' } as const

export function AppLayout({ children, hideNav = false }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const t = saved ?? 'light'
    document.documentElement.setAttribute('data-theme', t)
    return t
  })
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipLeft, setTooltipLeft] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

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

  const LABELS = ['레시피', '재료', theme === 'light' ? '다크' : '라이트', '새 레시피']

  return (
    <div className="flex min-h-screen flex-col">
      <main className={hideNav ? '' : 'pb-[calc(var(--tabbar-h)+var(--safe-bottom))]'}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 inset-x-0  z-50 flex h-[calc(var(--tabbar-h)+var(--safe-bottom))] items-center justify-center">
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
                to="/"
                active={isActive('/', true)}
                onHover={(v) => handleHover(v ? 0 : null)}
              >
                <Home size={18} />
              </PillItem>

              {/* 재료 */}
              <PillItem
                as="link"
                to="/ingredients"
                active={isActive('/ingredients')}
                onHover={(v) => handleHover(v ? 1 : null)}
              >
                <Package size={18} />
              </PillItem>

              {/* 다크모드 */}
              <PillItem
                as="button"
                active={false}
                onHover={(v) => handleHover(v ? 2 : null)}
                onClick={toggleTheme}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -20, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 20, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </motion.div>
                </AnimatePresence>
              </PillItem>

              {/* Separator */}
              <div className="mx-1 h-5 w-px bg-(--border)" />

              {/* FAB — pill 내부, primary 배경 */}
              <Link
                to="/recipe/new"
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-150 hover:scale-110 active:scale-95"
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
      onHover: (v: boolean) => void
      children: React.ReactNode
      onClick?: never
    }
  | {
      as: 'button'
      active: boolean
      onHover: (v: boolean) => void
      onClick: () => void
      children: React.ReactNode
      to?: never
    }

function PillItem({ as, to, active, onHover, onClick, children }: PillItemProps) {
  const cls = cn(
    'flex size-9 items-center justify-center rounded-full transition-colors duration-150',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-(--surface) hover:text-foreground'
  )

  if (as === 'link') {
    return (
      <Link
        to={to!}
        className={cls}
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
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
