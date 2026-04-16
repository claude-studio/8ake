import { motion } from 'framer-motion'

import { EASE_EXPO, VIEWPORT_NEAR } from '@/shared/lib/motion'

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
    <section className="bg-surface/40 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-2xl">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 0.5, ease: EASE_EXPO }}
          className="mb-16 flex items-center gap-3"
        >
          <div className="h-px w-6 bg-primary/40" />
          <span className="font-display text-[0.65rem] italic tracking-[0.18em] text-muted-foreground">
            3단계로 시작하는 베이킹 아카이브
          </span>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-12 md:flex-row md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_NEAR}
              transition={{ duration: 0.65, delay: i * 0.1, ease: EASE_EXPO }}
              className="flex flex-1 flex-col"
            >
              {/* Display number */}
              <div className="font-display mb-4 text-[5.5rem] font-bold leading-none tracking-[-0.04em] text-primary/15">
                {step.num}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-extrabold tracking-[-0.03em] text-foreground/80">
                  {step.title}
                </p>
                <p className="text-xs/relaxed font-normal text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
