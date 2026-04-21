import { useRef, useState } from 'react'

import { ChefHat } from 'lucide-react'

import { getPhotoUrl } from '@/entities/recipe'
import type { RecipePhoto } from '@/entities/recipe'
import { cn } from '@/shared/lib/utils'

const DOT_PATTERN_STYLE = {
  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

interface Props {
  photos: RecipePhoto[]
  thumbnailPhotoId?: string | null
  children?: React.ReactNode
}

export function PhotoGallery({ photos, thumbnailPhotoId, children }: Props) {
  const sorted = photos.slice(0, 5).sort((a, b) => a.order - b.order)
  const mainPhoto = sorted.find((p) => p.id === thumbnailPhotoId) ?? sorted[0] ?? null
  const subPhotos = sorted.filter((p) => p.id !== mainPhoto?.id)

  const [activePhoto, setActivePhoto] = useState<RecipePhoto | null>(null)
  const displayed = activePhoto ?? mainPhoto

  // 썸네일 목록: 메인 + 서브 순서로 구성
  const allPhotos = mainPhoto ? [mainPhoto, ...subPhotos] : subPhotos
  const activeIndex = activePhoto ? allPhotos.findIndex((p) => p.id === activePhoto.id) : 0

  const thumbGroupRef = useRef<HTMLDivElement>(null)

  const selectByIndex = (index: number) => {
    if (index === 0) {
      setActivePhoto(null)
    } else {
      setActivePhoto(allPhotos[index] ?? null)
    }
    // 포커스 이동
    const btns = thumbGroupRef.current?.querySelectorAll<HTMLElement>('button')
    btns?.[index]?.focus()
  }

  const handleThumbKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      selectByIndex(Math.min(index + 1, allPhotos.length - 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      selectByIndex(Math.max(index - 1, 0))
    }
  }

  return (
    <div className="bg-background px-4 pb-2 pt-4">
      {/* 이미지 컨테이너 — 카드처럼 rounded */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
        {/* 메인 이미지 */}
        <div className="relative aspect-4/3 w-full overflow-hidden">
          {/* 스크린리더: 사진 전환 알림 (이미지 alt 전체 반복 낭독 방지) */}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {`레시피 사진 ${activeIndex + 1} / ${sorted.length}`}
          </span>
          {displayed ? (
            <img
              key={displayed.id}
              src={getPhotoUrl(displayed.storage_path)}
              alt={`레시피 사진 ${activeIndex + 1}`}
              className="size-full  object-cover"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <div className="relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface">
              {/* 배경 도트 패턴 */}
              <div className="absolute inset-0 opacity-[0.04]" style={DOT_PATTERN_STYLE} />
              <div className="flex size-18 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                <ChefHat size={30} className="text-primary opacity-50" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/50">등록된 사진이 없습니다</p>
            </div>
          )}

          {/* 사진 카운트 */}
          {sorted.length > 1 && (
            <span
              className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              aria-hidden
            >
              {activeIndex + 1} / {sorted.length}
            </span>
          )}
        </div>

        {/* 서브 썸네일 */}
        {subPhotos.length > 0 && (
          <div
            ref={thumbGroupRef}
            className="flex gap-1.5 bg-card px-3 py-2.5"
            role="group"
            aria-label="사진 선택"
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              onKeyDown={(e) => handleThumbKeyDown(e, 0)}
              aria-label={`사진 1 보기${!activePhoto ? ' (현재 표시 중)' : ''}`}
              aria-pressed={!activePhoto}
              className={cn(
                'size-12  shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                !activePhoto ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-75'
              )}
            >
              {mainPhoto ? (
                <img
                  src={getPhotoUrl(mainPhoto.storage_path)}
                  alt=""
                  className="size-full  object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-surface">
                  <ChefHat size={14} className="text-primary opacity-40" />
                </div>
              )}
            </button>
            {subPhotos.map((photo, i) => {
              const thumbIndex = i + 1
              const isActive = activePhoto?.id === photo.id
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  onKeyDown={(e) => handleThumbKeyDown(e, thumbIndex)}
                  aria-label={`사진 ${thumbIndex + 1} 보기${isActive ? ' (현재 표시 중)' : ''}`}
                  aria-pressed={isActive}
                  className={cn(
                    'size-12  shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    isActive ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-75'
                  )}
                >
                  <img
                    src={getPhotoUrl(photo.storage_path)}
                    alt=""
                    className="size-full  object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Info 영역 — 이미지 바로 아래, 같은 px 안에 */}
      <div className="pt-4">{children}</div>
    </div>
  )
}
