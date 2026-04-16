import { motion } from 'framer-motion'
import { BookOpen, Camera, Package, PenLine, type LucideIcon } from 'lucide-react'

import { EASE_EXPO, VIEWPORT_NEAR } from '@/shared/lib/motion'

const features: { title: string; desc: string; Icon: LucideIcon }[] = [
  {
    title: '레시피를 한눈에 모아보기',
    desc: '사진, 재료, 만드는 법을 한 곳에. 검색과 정렬로 금방 찾아요.',
    Icon: BookOpen,
  },
  {
    title: '같은 레시피, 매번 베이킹 일지 작성',
    desc: '한 레시피로 여러 번 만들어도 회차별로 기록하고 비교할 수 있어요.',
    Icon: PenLine,
  },
  {
    title: '재료도 따로 기록하고 평가',
    desc: '밀가루, 버터, 초콜릿... 어디서 샀는지, 괜찮았는지 메모하세요.',
    Icon: Package,
  },
  {
    title: '사진으로 기록을 남기세요',
    desc: '레시피마다 사진을 올리고 대표 이미지를 지정하세요.',
    Icon: Camera,
  },
]

export function FeaturesSection() {
  return (
    <section className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-2xl">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT_NEAR}
          transition={{ duration: 0.5, ease: EASE_EXPO }}
          className="mb-12 flex items-center gap-3"
        >
          <div className="h-px w-6 bg-primary/40" />
          <span className="font-display text-[0.65rem] italic tracking-[0.18em] text-muted-foreground">
            이런 걸 할 수 있어요
          </span>
        </motion.div>

        {/* Editorial list — no icons, number as anchor */}
        <div className="flex flex-col">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_NEAR}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE_EXPO }}
              className="flex items-start gap-6 border-t border-border py-6"
            >
              <span className="font-display w-7 shrink-0 pt-1 text-xs italic text-primary/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-extrabold tracking-[-0.02em] text-foreground/80">
                    {f.title}
                  </p>
                  <f.Icon size={15} className="shrink-0 text-primary/65" />
                </div>
                <p className="text-xs/relaxed font-normal text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  )
}
