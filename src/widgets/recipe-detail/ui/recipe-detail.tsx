import { useMemo, useState } from 'react'

import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  ClipboardList,
  Clock,
  Coins,
  ExternalLink,
  Flame,
  Link2,
  Lock,
  PenLine,
  Play,
  ScrollText,
  Thermometer,
  Timer,
  UtensilsCrossed,
} from 'lucide-react'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useRecipe } from '@/entities/recipe'
import { cn } from '@/shared/lib/utils'

import { PhotoGallery } from './photo-gallery'

const STEP_NUMBER_RE = /^(\d+)\.\s*(.*)$/
const AMOUNT_NUMBER_RE = /^(\d+(?:\.\d+)?)\s*(.*)$/

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
  const [multiplier, setMultiplier] = useState(1)

  const recipeIngredients = recipe?.recipe_ingredients
  const sortedIngredients = useMemo(
    () => [...(recipeIngredients ?? [])].sort((a, b) => a.order - b.order),
    [recipeIngredients]
  )

  const estimatedCost = useMemo(() => {
    if (!sortedIngredients.length) return null
    let total = 0
    let hasAnyPrice = false
    for (const ing of sortedIngredients) {
      const snapshot = ing.unit_price_snapshot
      if (snapshot == null || !ing.amount) continue
      hasAnyPrice = true
      const match = ing.amount.match(/^(\d+(?:\.\d+)?)/)
      if (match) total += parseFloat(match[1]) * Number(snapshot)
    }
    return hasAnyPrice ? total : null
  }, [sortedIngredients])

  const steps = recipe?.steps
  const parsedSteps = useMemo(() => (steps ? steps.split('\n').filter(Boolean) : []), [steps])

  const preheatTemp = recipe?.preheat_temp
  const preheatTime = recipe?.preheat_time
  const ovenTemp = recipe?.oven_temp
  const bakeTime = recipe?.bake_time
  const quantity = recipe?.quantity
  const hasPreheat = preheatTemp || preheatTime
  const preheatCount = [preheatTemp, preheatTime].filter(Boolean).length
  const mainCount = [ovenTemp, bakeTime, quantity].filter(Boolean).length

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

  const hasMeta =
    recipe.preheat_temp ||
    recipe.preheat_time ||
    recipe.oven_temp ||
    recipe.bake_time ||
    recipe.quantity

  return (
    <div className="flex flex-col">
      {/* Hero: Photo gallery + Info overlay */}
      <PhotoGallery photos={recipe.recipe_photos} thumbnailPhotoId={recipe.thumbnail_photo_id}>
        {/* Recipe name */}
        <h1 className="text-2xl font-extrabold text-foreground mb-[10px] mt-0 leading-[1.2] tracking-[-0.5px]">
          {recipe.name}
        </h1>

        {/* Source row */}
        {recipe.source_type ? (
          <div className="flex items-center gap-1.5 text-sm mb-2.5">
            <span className="text-muted-foreground">
              {SOURCE_ICONS[recipe.source_type] ?? <ExternalLink size={14} />}
            </span>
            <span className="font-semibold text-muted-foreground">
              {SOURCE_LABELS[recipe.source_type] ?? recipe.source_type}
            </span>
            {recipe.source_url ? (
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
            ) : null}
          </div>
        ) : null}

        {/* Badges row: visibility + tags */}
        <div className={cn('flex items-center flex-wrap gap-1.5', hasMeta ? 'mb-3' : 'mb-0')}>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full',
              recipe.is_public
                ? 'bg-(--success-bg) text-(--success-text) border border-(--success-border)'
                : 'bg-surface text-muted-foreground border border-border'
            )}
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
            <Link
              key={tag}
              to="/home"
              search={{ tag }}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-(--primary-dim) text-primary border border-(--primary-border) no-underline"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Meta row inside hero info card */}
        {hasMeta ? (
          <div className="flex flex-col gap-2">
            {/* 예열 행 */}
            {hasPreheat ? (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${preheatCount}, 1fr)` }}
              >
                {recipe.preheat_temp ? (
                  <MetaCard
                    icon={<Thermometer size={18} />}
                    label="예열 온도"
                    value={recipe.preheat_temp}
                  />
                ) : null}
                {recipe.preheat_time ? (
                  <MetaCard
                    icon={<Timer size={18} />}
                    label="예열 시간"
                    value={recipe.preheat_time}
                  />
                ) : null}
              </div>
            ) : null}
            {/* 오븐/시간/분량 행 */}
            {mainCount > 0 ? (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${mainCount}, 1fr)` }}
              >
                {recipe.oven_temp ? (
                  <MetaCard icon={<Flame size={18} />} label="오븐 온도" value={recipe.oven_temp} />
                ) : null}
                {recipe.bake_time ? (
                  <MetaCard icon={<Clock size={18} />} label="굽는 시간" value={recipe.bake_time} />
                ) : null}
                {recipe.quantity ? (
                  <MetaCard
                    icon={<UtensilsCrossed size={18} />}
                    label="분량"
                    value={recipe.quantity}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </PhotoGallery>

      {/* Tab bar */}
      <div className="sticky top-(--subheader-h) z-150 border-b border-border bg-background">
        <div className="mx-auto flex h-11 w-full max-w-[1024px] px-4">
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
      <div className="w-full px-4 pt-5 pb-[60px]">
        {/* Tab content */}
        {tab === 'recipe' && (
          <div className="space-y-5">
            {/* Ingredients */}
            {recipe.recipe_ingredients.length > 0 ? (
              <div className="bg-card border border-border rounded-xl shadow-(--shadow-card) overflow-hidden">
                <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5 border-b border-border">
                  <h2 className="flex items-center gap-1.5 font-bold text-xs tracking-wide uppercase text-primary m-0">
                    <ClipboardList size={13} /> 재료
                  </h2>
                  {recipe.quantity ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{recipe.quantity} 기준</span>
                      <NativeSelect
                        value={multiplier}
                        onChange={(e) => setMultiplier(Number(e.target.value))}
                        className="h-7 py-0 pl-2 pr-4.5 text-xs font-semibold min-w-0 w-auto"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <NativeSelectOption key={n} value={n}>
                            {n}배
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>
                  ) : null}
                </div>
                <ul className="list-none m-0 py-2">
                  {sortedIngredients.map((ing, idx, arr) => (
                    <li
                      key={ing.id}
                      className={cn(
                        'flex items-center text-sm text-foreground px-4 min-h-8',
                        idx < arr.length - 1 ? 'border-b border-dashed border-border' : ''
                      )}
                    >
                      <span className="mr-2 text-muted-foreground text-[13px] shrink-0">·</span>
                      <span className="flex-1">{ing.name}</span>
                      {ing.amount ? (
                        <span className="shrink-0 text-muted-foreground font-medium min-w-[56px] text-right">
                          {multiplyAmount(ing.amount, multiplier)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {estimatedCost !== null ? (
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary">
                      <Coins size={13} /> 예상 원가
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(estimatedCost * multiplier).toLocaleString()}원
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Steps */}
            {recipe.steps ? (
              <div className="bg-card border border-border rounded-xl shadow-(--shadow-card) overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-[14px] pb-[10px] border-b border-border">
                  <h2 className="flex items-center gap-1.5 font-bold text-xs tracking-wide uppercase text-primary m-0">
                    <ScrollText size={13} /> 만드는 법
                  </h2>
                </div>
                <div className="px-4 py-2">
                  {parsedSteps.map((line, i) => {
                    const match = line.match(STEP_NUMBER_RE)
                    if (match) {
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex gap-3 py-3',
                            i < parsedSteps.length - 1 ? 'border-b border-dashed border-border' : ''
                          )}
                        >
                          <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-extrabold flex items-center justify-center shrink-0 mt-px">
                            {match[1]}
                          </span>
                          <span className="text-sm text-foreground leading-[1.7] pt-0.5">
                            {match[2]}
                          </span>
                        </div>
                      )
                    }
                    return (
                      <p
                        key={i}
                        className={cn(
                          'text-sm text-foreground leading-[1.7] py-3 m-0',
                          i < parsedSteps.length - 1 ? 'border-b border-dashed border-border' : ''
                        )}
                      >
                        {line}
                      </p>
                    )
                  })}
                </div>
                {/* memo-box: 만드는 법 카드 안에 위치 (시안과 동일) */}
                {recipe.memo ? (
                  <div className="mx-4 mb-4 border-[1.5px] border-dashed border-border rounded-lg px-[14px] py-3 bg-surface">
                    <div className="flex items-center gap-1 font-bold text-xs uppercase text-primary mb-1.5 tracking-[0.5px]">
                      <PenLine size={11} /> 메모
                    </div>
                    <p className="text-sm/relaxed text-muted-foreground m-0">{recipe.memo}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Delete */}
            {deleteSlot}
          </div>
        )}

        {tab === 'reviews' ? <div>{reviewListSlot}</div> : null}
      </div>
    </div>
  )
}

function multiplyAmount(amount: string, multiplier: number): string {
  if (multiplier === 1) return amount
  const match = amount.match(AMOUNT_NUMBER_RE)
  if (!match) return amount
  const num = parseFloat(match[1]) * multiplier
  const unit = match[2]
  const formatted = Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, '')
  return unit ? `${formatted}${unit}` : formatted
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1 text-primary">{icon}</div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}
