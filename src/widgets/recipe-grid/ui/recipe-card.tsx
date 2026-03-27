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

const noPhotoStyle: React.CSSProperties = {
  backgroundColor: 'var(--card-placeholder-bg)',
}

const noPhotoNameStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--card-placeholder-text)',
  fontWeight: 600,
  maxWidth: '80%',
  textAlign: 'center',
  lineHeight: 1.2,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const dateDayStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 800,
  lineHeight: 1,
}

const dateMonthStyle: React.CSSProperties = {
  fontSize: '0.55rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
}

const dateWrapStyle: React.CSSProperties = {
  transform: 'rotate(-3.5deg)',
  textAlign: 'center',
  flexShrink: 0,
  lineHeight: 1,
  color: 'var(--primary)',
  opacity: 0.7,
}

const yearStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  color: 'var(--muted-foreground)',
  fontWeight: 500,
  opacity: 0.6,
}

const sourceBadgeStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 600,
  color: 'var(--muted-foreground)',
  border: '1px solid var(--border)',
  borderRadius: 3,
  padding: '1px 5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const dashedDividerStyle: React.CSSProperties = {
  borderTop: '1px dashed var(--border)',
  margin: '6px 0',
}

const tagStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  color: 'var(--primary)',
  fontWeight: 500,
}

const extraTagStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  color: 'var(--muted-foreground)',
}

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
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: '12px',
          padding: '8px 8px 12px',
        }}
      >
        {/* Polaroid thumbnail area */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: '4 / 3',
            borderRadius: '6px',
            backgroundColor: 'var(--surface)',
          }}
        >
          {thumbnail ? (
            <img
              src={getPhotoUrl(thumbnail.storage_path)}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1"
              style={noPhotoStyle}
            >
              <ImageOff size={32} color="var(--card-placeholder-icon)" />
              <span style={noPhotoNameStyle}>{name}</span>
            </div>
          )}
        </div>

        {/* Content area below polaroid border */}
        <div className="mt-2 px-1" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          {/* Title row + date stamp */}
          <div className="flex items-start justify-between gap-1">
            <h3
              className="font-bold truncate"
              style={{ color: 'var(--foreground)', fontSize: '0.88rem', fontWeight: 800 }}
            >
              {name}
            </h3>
            <div style={dateWrapStyle}>
              <div style={dateMonthStyle}>{month}</div>
              <div style={dateDayStyle}>{day}</div>
            </div>
          </div>

          {/* Score row */}
          {totalScore != null && (
            <div className="flex items-center justify-between mt-1">
              <CupcakeScore value={totalScore} size="sm" />
              <span style={yearStyle}>{year}</span>
            </div>
          )}

          {/* Source badge */}
          {source && (
            <div className="mt-1.5">
              <span style={sourceBadgeStyle}>{source}</span>
            </div>
          )}

          {/* Dashed divider */}
          {tags.length > 0 && <div style={dashedDividerStyle} />}

          {/* Tags footer */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayTags.map((tag) => (
                <span key={tag} style={tagStyle}>
                  #{tag}
                </span>
              ))}
              {extraCount > 0 && <span style={extraTagStyle}>+{extraCount}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
