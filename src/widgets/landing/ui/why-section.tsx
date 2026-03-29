import { motion } from 'framer-motion'

import { EASE, VIEWPORT_ONCE } from '@/shared/lib/motion'

const points = [
  {
    title: '같은 레시피를 여러 번 만들어도 괜찮아요',
    desc: '한 레시피에 여러 번의 베이킹 기록을 쌓아가세요.',
  },
  {
    title: '매번 성장하는 나의 베이킹',
    desc: '지난 기록과 비교하며 더 맛있는 결과를 만들어가세요.',
  },
  {
    title: '나만의 비공개 베이킹 노트',
    desc: '모든 레시피는 기본 비공개. 내 기록은 나만 볼 수 있어요.',
  },
]

export function WhySection() {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-[1024px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8 text-center text-xl font-bold tracking-[-0.02em] text-foreground"
        >
          왜 8ake인가요?
        </motion.h2>

        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.45, delay: i * 0.12, ease: EASE }}
              className="flex items-start gap-4 p-5"
            >
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-(--primary-dim)">
                <div className="size-1.5 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="mt-1 text-xs/relaxed text-muted-foreground">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
