import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { CakeSlice } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EASE, EASE_SPRING } from '@/shared/lib/motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

const iconAnim = {
  hidden: { opacity: 0, scale: 0.75 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_SPRING } },
}

export function HeroSection() {
  return (
    <section className="flex flex-col items-center px-5 py-24 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-sm flex-col items-center gap-5"
      >
        <motion.div
          variants={iconAnim}
          className="flex size-16 items-center justify-center rounded-2xl bg-primary shadow-(--shadow)"
        >
          <CakeSlice size={30} className="text-primary-foreground" strokeWidth={1.8} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] text-foreground"
        >
          오늘 만든 마들렌,
          <br />
          다음엔 더 맛있게.
        </motion.h1>

        <motion.p variants={fadeUp} className="text-sm/relaxed text-muted-foreground">
          레시피 기록부터 회고, 재료 리뷰까지.
          <br />
          나만의 베이킹 아카이브를 시작하세요.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2.5">
          <Button asChild size="lg" className="px-8">
            <Link to="/login">지금 시작하기</Link>
          </Button>
          <span className="text-xs text-muted-foreground">이메일만으로 30초 만에 시작</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
