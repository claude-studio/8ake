import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { EASE_EXPO, VIEWPORT_NEAR } from '@/shared/lib/motion'

export function BottomCtaSection() {
  return (
    <section className="px-6 pb-20 pt-4 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_NEAR}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-cta-dark px-8 py-16"
      >
        {/* Background watermark */}
        <div
          aria-hidden="true"
          className="font-display pointer-events-none absolute -bottom-6 -right-4 select-none text-[8rem] font-bold italic leading-none tracking-[-0.03em] text-background/10"
        >
          8ake
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-5">
          <div className="overflow-hidden">
            <h2 className="text-[clamp(2rem,7vw,3.5rem)] font-black leading-none tracking-[-0.05em] text-background">
              나만의 베이킹 아카이브,
              <br />
              지금 시작하세요.
            </h2>
          </div>

          <p className="max-w-[44ch] text-xs/relaxed font-normal text-background/65">
            이메일 하나로 30초. 완전 무료, 카드 불필요.
          </p>

          <Button
            asChild
            size="lg"
            className="w-fit bg-background px-8 text-foreground hover:bg-background/90"
          >
            <Link to="/login">무료로 시작하기</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
