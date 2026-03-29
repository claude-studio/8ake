import { motion } from 'framer-motion'
import { BookOpen, Camera, RotateCcw, Star } from 'lucide-react'

import { EASE, VIEWPORT_ONCE } from '@/shared/lib/motion'

const features = [
  {
    icon: BookOpen,
    title: '레시피를 한눈에 모아보기',
    desc: '사진, 재료, 만드는 법을 한 곳에. 검색과 정렬로 금방 찾아요.',
  },
  {
    icon: RotateCcw,
    title: '같은 레시피, 매번 다른 회고',
    desc: '한 레시피로 여러 번 만들어도 각각 기록하고 비교할 수 있어요.',
  },
  {
    icon: Star,
    title: '재료도 따로 기록하고 평가',
    desc: '밀가루, 버터, 초콜릿... 어디서 샀는지, 괜찮았는지 메모하세요.',
  },
  {
    icon: Camera,
    title: '사진으로 기록을 남기세요',
    desc: '레시피마다 사진을 올리고 대표 이미지를 지정하세요.',
  },
]

export function FeaturesSection() {
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
          이런 걸 할 수 있어요
        </motion.h2>

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card)"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-dim)">
                  <Icon size={18} className="text-primary" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm/snug font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-xs/relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
