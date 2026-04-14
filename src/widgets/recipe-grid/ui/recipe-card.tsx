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

const rotations = [-1, 0.5, -0.8, 1, -0.3, 0.7, -0.6, 0.9, -1.1, 0.4]

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
      className="block transition-transform hover:scale-[1.02]"
      style={
        {
          '--card-rotation': `${rotation}deg`,
          transform: `rotate(${rotation}deg)`,
          animation: `cardFall 0.45s ease-out both`,
          animationDelay: `${index * 0.04}s`,
        } as React.CSSProperties
      }
    >
      <div className="overflow-hidden bg-card border border-border shadow-(--shadow-card) rounded-xl px-2 pb-3 pt-2">
        {/* Polaroid thumbnail area */}
        <div className="relative w-full overflow-hidden aspect-4/3 rounded-[6px] bg-surface">
          {thumbnail ? (
            <img
              src={getPhotoUrl(thumbnail.storage_path)}
              alt={name}
              className="absolute inset-0 size-full  object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-(--card-placeholder-bg)">
              <ImageOff size={32} color="var(--card-placeholder-icon)" />
              <span className="text-[0.7rem] text-(--card-placeholder-text) font-semibold max-w-[80%] text-center leading-[1.2] overflow-hidden line-clamp-2">
                {name}
              </span>
            </div>
          )}
        </div>

        {/* Content area below polaroid border */}
        <div className="mt-2 border-t border-border px-1 pt-2">
          {/* Title row + date stamp */}
          <div className="flex items-start justify-between gap-1">
            <h3 className="truncate text-foreground text-[0.88rem] font-extrabold">{name}</h3>
            <div className="-rotate-[3.5deg] text-center shrink-0 leading-none text-primary opacity-70">
              <div className="text-[0.55rem] font-bold tracking-[0.06em]">{month}</div>
              <div className="text-base font-extrabold leading-none">{day}</div>
            </div>
          </div>

          {/* Score row */}
          {totalScore != null && (
            <div className="flex items-center justify-between mt-1">
              <CupcakeScore value={totalScore} size="sm" />
              <span className="text-[0.6rem] text-muted-foreground font-medium opacity-60">
                {year}
              </span>
            </div>
          )}

          {/* Source badge */}
          {source && (
            <div className="mt-1.5">
              <span className="text-[0.6rem] font-semibold text-muted-foreground border border-border rounded-[3px] px-[5px] py-px uppercase tracking-[0.04em]">
                {source}
              </span>
            </div>
          )}

          {/* Dashed divider */}
          {tags.length > 0 && <div className="border-t border-dashed border-border my-[6px]" />}

          {/* Tags footer */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayTags.map((tag) => (
                <span key={tag} className="text-[0.68rem] text-primary font-medium">
                  #{tag}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-[0.68rem] text-muted-foreground">+{extraCount}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
