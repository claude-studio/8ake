import { useState } from 'react'

import { ImageOff } from 'lucide-react'

import { getPhotoUrl } from '@/entities/recipe'
import type { RecipePhoto } from '@/entities/recipe'
import { cn } from '@/shared/lib/utils'

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
    <div className="bg-[var(--background)] px-4 pb-2 pt-4">
      {/* 이미지 컨테이너 — 카드처럼 rounded */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-card)]">
        {/* 메인 이미지 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {displayed ? (
            <img
              key={displayed.id}
              src={getPhotoUrl(displayed.storage_path)}
              alt="레시피 사진"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
              <ImageOff size={36} className="text-[var(--muted-foreground)] opacity-30" />
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
          <div className="flex gap-1.5 bg-[var(--card)] px-3 py-2.5">
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className={cn(
                'h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150',
                !activePhoto
                  ? 'border-[var(--primary)]'
                  : 'border-transparent opacity-50 hover:opacity-75'
              )}
            >
              {mainPhoto ? (
                <img
                  src={getPhotoUrl(mainPhoto.storage_path)}
                  alt="메인"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--surface)]">
                  <ImageOff size={14} className="text-[var(--muted-foreground)]" />
                </div>
              )}
            </button>
            {subPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhoto(photo)}
                className={cn(
                  'h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150',
                  activePhoto?.id === photo.id
                    ? 'border-[var(--primary)]'
                    : 'border-transparent opacity-50 hover:opacity-75'
                )}
              >
                <img
                  src={getPhotoUrl(photo.storage_path)}
                  alt="서브"
                  className="h-full w-full object-cover"
                  loading="lazy"
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
