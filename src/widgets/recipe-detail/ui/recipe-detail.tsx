import { useMemo, useState } from 'react'

import {
  BookOpen,
  ClipboardList,
  Clock,
  ExternalLink,
  Flame,
  Link2,
  Lock,
  PenLine,
  Play,
  ScrollText,
  UtensilsCrossed,
} from 'lucide-react'

import { useRecipe } from '@/entities/recipe'
import { cn } from '@/shared/lib/utils'

import { PhotoGallery } from './photo-gallery'

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  youtube: <Play size={13} />,
  blog: <Link2 size={13} />,
  book: <BookOpen size={13} />,
  etc: <ExternalLink size={13} />,
}

const SOURCE_LABELS: Record<string, string> = {
  youtube: '유튜브',
  blog: '블로그',
  book: '책',
  etc: '기타',
}

interface Props {
  recipeId: string
  reviewListSlot?: React.ReactNode
  deleteSlot?: React.ReactNode
}

export function RecipeDetail({ recipeId, reviewListSlot, deleteSlot }: Props) {
  const { data: recipe, isLoading, error } = useRecipe(recipeId)
  const [tab, setTab] = useState<'recipe' | 'reviews'>('recipe')

  const recipeIngredients = recipe?.recipe_ingredients
  const sortedIngredients = useMemo(
    () => [...(recipeIngredients ?? [])].sort((a, b) => a.order - b.order),
    [recipeIngredients]
  )

  const steps = recipe?.steps
  const parsedSteps = useMemo(() => (steps ? steps.split('\n').filter(Boolean) : []), [steps])

  const ovenTemp = recipe?.oven_temp
  const bakeTime = recipe?.bake_time
  const quantity = recipe?.quantity
  const metaColumns = useMemo(
    () => `repeat(${[ovenTemp, bakeTime, quantity].filter(Boolean).length}, 1fr)`,
    [ovenTemp, bakeTime, quantity]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        불러오는 중...
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        레시피를 찾을 수 없습니다.
      </div>
    )
  }

  const hasMeta = recipe.oven_temp || recipe.bake_time || recipe.quantity

  return (
    <div>
      {/* Hero: Photo gallery + Info overlay */}
      <PhotoGallery photos={recipe.recipe_photos} thumbnailPhotoId={recipe.thumbnail_photo_id}>
        {/* Recipe name */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--foreground)',
            margin: '0 0 10px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}
        >
          {recipe.name}
        </h1>

        {/* Source row */}
        {recipe.source_type && (
          <div className="flex items-center gap-1.5 text-sm mb-2.5">
            <span className="text-muted-foreground">
              {SOURCE_ICONS[recipe.source_type] ?? <ExternalLink size={14} />}
            </span>
            <span className="font-semibold text-muted-foreground">
              {SOURCE_LABELS[recipe.source_type] ?? recipe.source_type}
            </span>
            {recipe.source_url && (
              <>
                <span className="text-muted-foreground">·</span>
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary border-b border-transparent"
                >
                  링크 ↗
                </a>
              </>
            )}
          </div>
        )}

        {/* Badges row: visibility + tags */}
        <div
          className="flex items-center flex-wrap gap-1.5"
          style={{ marginBottom: hasMeta ? 12 : 0 }}
        >
          <span
            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: recipe.is_public ? 'var(--success-bg)' : 'var(--surface)',
              color: recipe.is_public ? 'var(--success-text)' : 'var(--muted-foreground)',
              border: `1px solid ${recipe.is_public ? 'var(--success-border)' : 'var(--border)'}`,
            }}
          >
            {recipe.is_public ? (
              '공개'
            ) : (
              <>
                <Lock size={11} /> 비공개
              </>
            )}
          </span>
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--primary-dim)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Meta row inside hero info card */}
        {hasMeta && (
          <div className="grid gap-2" style={{ gridTemplateColumns: metaColumns }}>
            {recipe.oven_temp && (
              <MetaCard icon={<Flame size={18} />} label="오븐 온도" value={recipe.oven_temp} />
            )}
            {recipe.bake_time && (
              <MetaCard icon={<Clock size={18} />} label="굽는 시간" value={recipe.bake_time} />
            )}
            {recipe.quantity && (
              <MetaCard icon={<UtensilsCrossed size={18} />} label="분량" value={recipe.quantity} />
            )}
          </div>
        )}
      </PhotoGallery>

      {/* Tab bar */}
      <div className="sticky top-(--subheader-h) z-150 border-b border-border bg-background">
        <div className="mx-auto flex h-11 max-w-[1024px] px-4">
          {(['recipe', 'reviews'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'relative flex flex-1 items-center justify-center text-sm tracking-[-0.2px] transition-colors duration-150',
                tab === t ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
              )}
            >
              {t === 'recipe' ? '레시피' : '베이킹 기록'}
              {tab === t && (
                <span className="absolute bottom-0 inset-x-2  h-[2.5px] rounded-t-sm bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content below hero */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '20px 16px 60px' }}>
        {/* Tab content */}
        {tab === 'recipe' && (
          <div className="space-y-5">
            {/* Ingredients */}
            {recipe.recipe_ingredients.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                }}
              >
                <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5 border-b border-border">
                  <h2 className="flex items-center gap-1.5 font-bold text-xs tracking-wide uppercase text-primary m-0">
                    <ClipboardList size={13} /> 재료
                  </h2>
                  {recipe.quantity && (
                    <span className="text-xs text-muted-foreground">{recipe.quantity} 기준</span>
                  )}
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: '8px 0',
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent, transparent 31px, var(--border) 31px, var(--border) 32px)',
                    backgroundPosition: '0 12px',
                  }}
                >
                  {sortedIngredients.map((ing, idx, arr) => (
                    <li
                      key={ing.id}
                      className="flex items-center text-sm"
                      style={{
                        color: 'var(--foreground)',
                        padding: '7px 16px',
                        minHeight: 32,
                        borderBottom: idx < arr.length - 1 ? '1px dashed var(--border)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          marginRight: 8,
                          color: 'var(--muted-foreground)',
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ·
                      </span>
                      <span className="flex-1">{ing.name}</span>
                      {ing.amount && (
                        <span
                          className="shrink-0"
                          style={{
                            color: 'var(--muted-foreground)',
                            fontWeight: 500,
                            minWidth: 56,
                            textAlign: 'right',
                          }}
                        >
                          {ing.amount}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && (
              <div
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: '14px 16px 10px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <h2 className="flex items-center gap-1.5 font-bold text-xs tracking-wide uppercase text-primary m-0">
                    <ScrollText size={13} /> 만드는 법
                  </h2>
                </div>
                <div
                  style={{
                    padding: '16px',
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent, transparent 31px, var(--border) 31px, var(--border) 32px)',
                    backgroundPosition: '0 12px',
                  }}
                >
                  {parsedSteps.map((line, i) => {
                    const match = line.match(/^(\d+)\.\s*(.*)$/)
                    if (match) {
                      return (
                        <div key={i} className="flex gap-3" style={{ marginBottom: 16 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'var(--primary)',
                              color: 'var(--primary-foreground)',
                              fontSize: 12,
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {match[1]}
                          </span>
                          <span className="text-sm text-foreground leading-[1.7] pt-0.5">
                            {match[2]}
                          </span>
                        </div>
                      )
                    }
                    return (
                      <p key={i} className="text-sm text-foreground leading-[1.7] mb-2">
                        {line}
                      </p>
                    )
                  })}
                </div>
                {/* memo-box: 만드는 법 카드 안에 위치 (시안과 동일) */}
                {recipe.memo && (
                  <div
                    style={{
                      margin: '0 16px 16px',
                      border: '1.5px dashed var(--border)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <div className="font-bold text-xs uppercase text-primary mb-1.5 tracking-[0.5px]">
                      <PenLine size={11} /> 메모
                    </div>
                    <p className="text-sm/relaxed text-muted-foreground m-0">{recipe.memo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Delete */}
            {deleteSlot}
          </div>
        )}

        {tab === 'reviews' && <div>{reviewListSlot}</div>}
      </div>
    </div>
  )
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 4,
          color: 'var(--primary)',
        }}
      >
        {icon}
      </div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}
