import { useState } from 'react'

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

  return (
    <div className="bg-background px-4 pb-2 pt-4">
      {/* 이미지 컨테이너 — 카드처럼 rounded */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card)">
        {/* 메인 이미지 */}
        <div className="relative aspect-4/3 w-full overflow-hidden">
          {displayed ? (
            <img
              key={displayed.id}
              src={getPhotoUrl(displayed.storage_path)}
              alt="레시피 사진"
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
            <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {sorted.indexOf(displayed!) + 1} / {sorted.length}
            </span>
          )}
        </div>

        {/* 서브 썸네일 */}
        {subPhotos.length > 0 && (
          <div className="flex gap-1.5 bg-card px-3 py-2.5">
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className={cn(
                'size-12  shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150',
                !activePhoto ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-75'
              )}
            >
              {mainPhoto ? (
                <img
                  src={getPhotoUrl(mainPhoto.storage_path)}
                  alt="메인"
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
            {subPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhoto(photo)}
                className={cn(
                  'size-12  shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150',
                  activePhoto?.id === photo.id
                    ? 'border-primary'
                    : 'border-transparent opacity-50 hover:opacity-75'
                )}
              >
                <img
                  src={getPhotoUrl(photo.storage_path)}
                  alt="서브"
                  className="size-full  object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info 영역 — 이미지 바로 아래, 같은 px 안에 */}
      <div className="pt-4">{children}</div>
    </div>
  )
}
