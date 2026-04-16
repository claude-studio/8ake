import { motion } from 'framer-motion'

import { EASE_EXPO, VIEWPORT_NEAR } from '@/shared/lib/motion'

const points = [
  {
    title: '레시피, 기록, 재료가 하나로 연결',
    desc: '노트앱에 흩어지던 메모·사진·재료 정보가 레시피를 중심으로 체계적으로 묶여요.',
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
    <section className="bg-surface/40 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-2xl">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 0.5, ease: EASE_EXPO }}
          className="mb-14 flex items-center gap-3"
        >
          <div className="h-px w-6 bg-primary/40" />
          <span className="font-display text-[0.65rem] italic tracking-[0.18em] text-muted-foreground">
            왜 8ake인가요?
          </span>
        </motion.div>

        <div className="flex flex-col gap-12">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_NEAR}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_EXPO }}
              className="flex flex-col gap-2"
            >
              {/* Index marker */}
              <span className="font-display text-[0.625rem] italic tracking-[0.2em] text-primary/50 uppercase">
                0{i + 1}
              </span>
              <p className="text-2xl/tight font-black tracking-[-0.04em] text-foreground/75">
                {point.title}
              </p>
              <p className="max-w-[44ch] text-xs/relaxed font-normal text-muted-foreground">
                {point.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
