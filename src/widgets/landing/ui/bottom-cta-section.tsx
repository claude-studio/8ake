import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { EASE, VIEWPORT_ONCE } from '@/shared/lib/motion'

export function BottomCtaSection() {
  return (
    <section className="px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 0.55, ease: EASE }}
        className="mx-auto flex max-w-[1024px] flex-col items-center gap-5 rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-(--shadow-card)"
      >
        <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-foreground">
          나만의 베이킹 아카이브,
          <br />
          지금 시작하세요.
        </h2>
        <p className="text-sm text-muted-foreground">
          이메일 하나로 30초 만에 가입. 무료로 시작할 수 있어요.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link to="/login">무료로 시작하기</Link>
        </Button>
      </motion.div>
    </section>
  )
}
