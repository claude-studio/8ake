import { motion } from 'framer-motion'

import { EASE, VIEWPORT_ONCE } from '@/shared/lib/motion'

const steps = [
  {
    num: '01',
    title: '레시피 기록',
    desc: '레시피 이름, 재료, 만드는 법, 사진을 입력하세요.',
  },
  {
    num: '02',
    title: '베이킹 후 회고',
    desc: '만들어본 뒤 점수와 한줄평을 남기세요. 같은 레시피를 여러 번 기록할 수 있어요.',
  },
  {
    num: '03',
    title: '돌아보기',
    desc: '내 베이킹 기록을 한눈에 돌아보세요.',
  },
]

export function StepsSection() {
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-[1024px]">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10 text-center text-xl font-bold tracking-[-0.02em] text-foreground"
        >
          3단계로 시작하는 베이킹 아카이브
        </motion.h2>

        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
              className="flex flex-1 flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card)"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-primary-foreground">{step.num}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <p className="text-xs/relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
