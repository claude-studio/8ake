import { Link } from '@tanstack/react-router'
import { ImageOff } from 'lucide-react'

import { getPhotoUrl, type RecipePhoto } from '@/entities/recipe'
import { CupcakeScore } from '@/shared/ui'

interface Props {
  id: string
  name: string
  tags: string[]
  totalScore?: number | null
  sourceType?: string | null
  createdAt: string
  photos: RecipePhoto[]
  index: number
}

const sourceLabel: Record<string, string> = {
  youtube: 'YouTube',
  blog: '블로그',
  book: '책',
  etc: '직접 개발',
}

export const rotations = [-1, 0.5, -0.8, 1, -0.3, 0.7, -0.6, 0.9, -1.1, 0.4]

export function RecipeCard({
  id,
  name,
  tags,
  totalScore,
  sourceType,
  createdAt,
  photos,
  index,
}: Props) {
  const rotation = rotations[index % rotations.length]
  const thumbnail = photos.find((p) => p.order === 0) ?? photos[0]
  const displayTags = tags.slice(0, 3)
  const extraCount = tags.length - 3

  const date = new Date(createdAt)
  const month = date.toLocaleString('en', { month: 'short' }).toUpperCase()
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()

  const source = sourceType ? (sourceLabel[sourceType] ?? sourceType) : null

  return (
    <Link
      to="/recipe/$id"
      params={{ id }}
      className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={
        {
          '--card-rotation': `${rotation}deg`,
          transform: `rotate(${rotation}deg)`,
          animation: `cardFall 0.45s ease-out both`,
          animationDelay: `${Math.min(index * 0.04, 0.2)}s`,
        } as React.CSSProperties
      }
    >
      <div className="overflow-hidden bg-card border border-border rounded-xl px-2 pt-2 pb-4 shadow-(--shadow-card)">
        {/* Polaroid thumbnail */}
        <div className="relative w-full overflow-hidden aspect-4/3 rounded-[6px] bg-surface">
          {thumbnail ? (
            <img
              src={getPhotoUrl(thumbnail.storage_path)}
              alt={name}
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-(--card-placeholder-bg)">
              <ImageOff size={28} color="var(--card-placeholder-icon)" strokeWidth={1.5} />
              <span className="text-[0.65rem] text-(--card-placeholder-text) font-semibold max-w-[80%] text-center leading-tight line-clamp-2">
                {name}
              </span>
            </div>
          )}
        </div>

        {/* Polaroid content strip */}
        <div className="mt-3 px-1">
          {/* Title + rubber-stamp date */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground text-[0.88rem] font-extrabold leading-tight line-clamp-2 flex-1">
              {name}
            </h3>
            <div
              className="shrink-0 text-center leading-none text-primary"
              style={{ transform: 'rotate(-3.5deg)', opacity: 0.6 }}
            >
              <div className="text-[0.48rem] font-bold tracking-widest font-mono">{month}</div>
              <div className="text-[1.05rem] font-extrabold leading-none">{day}</div>
              <div className="text-[0.45rem] font-medium tracking-wider opacity-80">{year}</div>
            </div>
          </div>

          {/* Score */}
          {totalScore != null && (
            <div className="mt-1.5">
              <CupcakeScore value={totalScore} size="sm" />
            </div>
          )}

          {/* Source badge */}
          {source && (
            <div className="mt-1.5">
              <span className="text-[0.58rem] font-bold text-muted-foreground border border-border rounded-[3px] px-[5px] py-[2px] uppercase tracking-[0.05em]">
                {source}
              </span>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <div className="border-t border-dashed border-border my-[7px]" />
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {displayTags.map((tag) => (
                  <span key={tag} className="text-[0.65rem] text-primary font-semibold">
                    #{tag}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="text-[0.65rem] text-muted-foreground/60">+{extraCount}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
