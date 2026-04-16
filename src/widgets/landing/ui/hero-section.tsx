import { useState } from 'react'

import { Link } from '@tanstack/react-router'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { EASE_EXPO } from '@/shared/lib/motion'

const STAGGER = 0.12

export function HeroSection() {
  const { scrollY } = useScroll()
  const [hasScrolled, setHasScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 60) setHasScrolled(true)
  })

  return (
    <section className="relative flex h-dvh flex-col justify-between overflow-hidden px-6 pb-14 pt-8 md:px-12">
      {/* Background typographic watermark */}
      <div
        aria-hidden="true"
        className="font-display pointer-events-none absolute -right-4 bottom-16 select-none text-[clamp(7rem,28vw,18rem)] font-bold italic leading-none tracking-[-0.03em] text-foreground/4"
      >
        Archive
      </div>

      {/* Top label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_EXPO, delay: STAGGER * 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-px w-6 bg-primary/30" />
        <span className="font-display text-[0.65rem] italic tracking-[0.18em] text-muted-foreground/60">
          Baking Archive
        </span>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col gap-7">
        {/* Headline — line 1 */}
        <div className="flex flex-col gap-0">
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: EASE_EXPO, delay: STAGGER * 1 }}
              className="text-[clamp(1.5rem,5.5vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground/70"
            >
              오늘 만든 마들렌,
            </motion.p>
          </div>
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: EASE_EXPO, delay: STAGGER * 2 }}
              className="text-[clamp(2.6rem,11vw,7rem)] font-black leading-[0.95] tracking-[-0.05em] text-primary"
            >
              다음엔 더 맛있게.
            </motion.p>
          </div>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EXPO, delay: STAGGER * 4 }}
          className="max-w-[40ch] text-sm/relaxed text-muted-foreground"
        >
          레시피 기록부터 회고, 재료 리뷰까지.
          <br />
          나만의 베이킹 아카이브를 시작하세요.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_EXPO, delay: STAGGER * 5 }}
          className="flex flex-col items-start gap-3"
        >
          <Button asChild size="lg" className="px-8">
            <Link to="/login">무료로 시작하기</Link>
          </Button>
          <span className="text-xs text-muted-foreground/70">이메일만으로 · 카드 불필요</span>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hasScrolled ? 0 : 1 }}
        transition={{ duration: 0.6, delay: hasScrolled ? 0 : STAGGER * 7, ease: EASE_EXPO }}
        className="flex items-center gap-3"
      >
        <span className="text-[0.6rem] font-semibold tracking-[0.28em] text-muted-foreground/60 uppercase">
          Scroll
        </span>
        <div className="h-px w-8 bg-border" />
      </motion.div>
    </section>
  )
}
