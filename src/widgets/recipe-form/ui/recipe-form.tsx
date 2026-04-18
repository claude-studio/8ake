import { useCallback, useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Check, Loader2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { fetchIngredients } from '@/entities/ingredient'
import { createRecipe, updateRecipe, fetchRecipe, recipeKeys } from '@/entities/recipe'
import { useAuthStore } from '@/features/auth'
import type { PhotoUploadStatus } from '@/features/photo-upload'
import { supabase } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { PageHeader } from '@/shared/ui'

import { BasicInfoSection } from './basic-info-section'
import { IngredientsSection } from './ingredients-section'
import { PhotoSection } from './photo-section'
import { StepsSection } from './steps-section'
import {
  RecipeSchemaRefined,
  type RecipeFormValues,
  type RecipeFormOutput,
} from '../model/recipe-schema'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
  isDataLoading?: boolean
  headerRight?: React.ReactNode
}

const STEP_LABELS = ['메뉴 정보', '재료 목록', '만드는 법 · 메모', '완성 사진'] as const
const STEP_OPTIONAL = [false, false, false, true] as const

function CardHeader({ index, extra }: { index: number; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <span
          className="size-6 rounded-full bg-(--primary-dim) border border-(--primary-border) flex items-center justify-center text-[11px] font-bold text-primary shrink-0"
          aria-hidden
        >
          {index + 1}
        </span>
        <h2 className="text-[16px] font-bold tracking-[-0.03em] text-foreground m-0">
          {STEP_LABELS[index]}
        </h2>
        {STEP_OPTIONAL[index] && (
          <span className="text-[10px] font-semibold text-muted-foreground bg-surface border border-border rounded-full px-2 py-0.5">
            선택사항
          </span>
        )}
      </div>
      {extra}
    </div>
  )
}

function SectionSkeleton({ variant = 'fields' }: { variant?: 'fields' | 'steps' }) {
  if (variant === 'steps') {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
        </div>
        <div className="h-[250px] rounded-lg bg-muted mt-2" />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-14 rounded bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-8 rounded bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function parseFieldValue(s: string | null | undefined): number | undefined {
  if (!s) return undefined
  const m = s.match(/^(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : undefined
}

function parseTimeUnit(s: string | null | undefined): '분' | '시간' {
  if (!s) return '분'
  return s.includes('시간') ? '시간' : '분'
}

function parseIngredientAmount(s: string): {
  amount: string
  unit: '개' | 'g' | '직접입력'
} {
  if (!s) return { amount: '', unit: 'g' }
  const m = s.match(/^(\d+(?:\.\d+)?)(개|g)$/)
  if (m) return { amount: m[1], unit: m[2] as '개' | 'g' }
  return { amount: s, unit: '직접입력' }
}

function buildIngredientRows(
  recipeId: string,
  ingredients: RecipeFormValues['ingredients'],
  priceMap?: Map<string, number>
) {
  return ingredients.map((ing, i) => ({
    recipe_id: recipeId,
    name: ing.name,
    amount:
      ing.unit === '직접입력' ? ing.amount || null : ing.amount ? `${ing.amount}${ing.unit}` : null,
    order: i,
    unit_price_snapshot: priceMap?.get(ing.name.trim().toLowerCase()) ?? null,
  }))
}

function submitButtonContent({
  isSaved,
  isSubmitting,
  isEditUnchanged,
}: {
  isSaved: boolean
  isSubmitting: boolean
  isEditUnchanged: boolean
}) {
  if (isSaved)
    return (
      <>
        <Check size={16} className="animate-in fade-in-0 zoom-in-95 duration-150" />
        저장됨
      </>
    )
  if (isSubmitting)
    return (
      <>
        <Loader2 size={16} className="animate-spin" />
        저장 중...
      </>
    )
  if (isEditUnchanged) return '변경한 내용이 없어요'
  return '저장하기'
}

export function RecipeForm({ mode, recipeId, isDataLoading, headerRight }: Props) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [photosChanged, setPhotosChanged] = useState(false)
  const [unitsChanged, setUnitsChanged] = useState(false)
  const [loadKey, setLoadKey] = useState(0)
  const [bakeTimeUnit, setBakeTimeUnit] = useState<'분' | '시간'>('분')
  const [preheatTimeUnit, setPreheatTimeUnit] = useState<'분' | '시간'>('분')
  const formLoaded = useRef(false)

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    },
    []
  )

  const unitsRef = useRef<{ bakeTimeUnit: string; preheatTimeUnit: string }>({
    bakeTimeUnit: '분',
    preheatTimeUnit: '분',
  })

  // Photos managed outside react-hook-form to avoid type conflicts
  const photosRef = useRef<{ files: File[]; thumbnailIndex: number }>({
    files: [],
    thumbnailIndex: 0,
  })

  // 업로드 상태 추적
  const [uploadStates, setUploadStates] = useState<PhotoUploadStatus[]>([])
  // 실패한 사진 재시도를 위한 상태 (recipeId 확정 후 사용)
  const pendingRetryRef = useRef<{ recipeId: string; thumbnailIndex: number } | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(RecipeSchemaRefined) as never,
    defaultValues: {
      name: '',
      source_type: 'etc',
      source_url: '',
      oven_temp: undefined,
      bake_time: undefined,
      quantity: undefined,
      preheat_temp: undefined,
      preheat_time: undefined,
      steps: '',
      memo: '',
      tags: [],
      is_public: false,
      ingredients: [{ name: '', amount: '', unit: 'g' as const }],
    },
  })

  const appendIngredientRef = useRef<() => void>(() => {})

  const handleAppendRef = useCallback((fn: () => void) => {
    appendIngredientRef.current = fn
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !recipeId || formLoaded.current) return

    async function load() {
      try {
        const recipe = await fetchRecipe(recipeId!)
        formLoaded.current = true
        // 단위 복원
        const units = {
          bakeTimeUnit: parseTimeUnit(recipe.bake_time),
          preheatTimeUnit: parseTimeUnit(recipe.preheat_time),
        }
        unitsRef.current = units
        setBakeTimeUnit(units.bakeTimeUnit)
        setPreheatTimeUnit(units.preheatTimeUnit)

        reset({
          name: recipe.name,
          source_type: (recipe.source_type as RecipeFormValues['source_type']) ?? undefined,
          source_url: recipe.source_url ?? '',
          oven_temp: parseFieldValue(recipe.oven_temp),
          bake_time: parseFieldValue(recipe.bake_time),
          quantity: parseFieldValue(recipe.quantity),
          preheat_temp: parseFieldValue(recipe.preheat_temp),
          preheat_time: parseFieldValue(recipe.preheat_time),
          steps: recipe.steps ?? '',
          memo: recipe.memo ?? '',
          tags: recipe.tags ?? [],
          is_public: recipe.is_public,
          ingredients:
            recipe.recipe_ingredients.length > 0
              ? recipe.recipe_ingredients.map((ri) => {
                  const parsed = parseIngredientAmount(ri.amount ?? '')
                  return { name: ri.name, amount: parsed.amount, unit: parsed.unit }
                })
              : [{ name: '', amount: '', unit: 'g' as const }],
        })
      } catch {
        toast.error('레시피를 불러오는데 실패했습니다')
      }
    }

    load()
  }, [mode, recipeId, reset, loadKey])

  const handlePhotoChange = useCallback(
    (files: File[], thumbnailIndex: number) => {
      photosRef.current = { files, thumbnailIndex }
      // 파일 목록이 바뀌면 업로드 상태 초기화
      setUploadStates(files.map(() => 'idle'))
      if (mode === 'edit') setPhotosChanged(true)
    },
    [mode]
  )

  const uploadPhotos = useCallback(
    async (targetRecipeId: string, files: File[], thumbnailIndex: number) => {
      if (!user || files.length === 0) return

      // 업로드 시작 — 모든 파일 'uploading' 상태로
      setUploadStates(files.map(() => 'uploading'))

      const uploadOne = async (file: File, i: number): Promise<string | null> => {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const safePath = `${user.id}/${targetRecipeId}/${Date.now()}-${i}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('recipe-photos')
          .upload(safePath, file, { cacheControl: '3600', contentType: file.type })

        if (uploadError) {
          setUploadStates((prev) => {
            const next = [...prev]
            next[i] = 'error'
            return next
          })
          return null
        }

        const { data: photoRow, error: insertError } = await supabase
          .from('recipe_photos')
          .insert({ recipe_id: targetRecipeId, storage_path: safePath, order: i })
          .select('id')
          .single()

        if (insertError) {
          setUploadStates((prev) => {
            const next = [...prev]
            next[i] = 'error'
            return next
          })
          return null
        }

        setUploadStates((prev) => {
          const next = [...prev]
          next[i] = 'done'
          return next
        })
        return photoRow.id
      }

      const results = await Promise.all(files.map((file, i) => uploadOne(file, i)))
      const photoIds = results.filter((id): id is string => id !== null)

      if (photoIds.length > 0 && photoIds[thumbnailIndex]) {
        await updateRecipe(targetRecipeId, { thumbnail_photo_id: photoIds[thumbnailIndex] })
      }

      // 실패 파일이 있으면 재시도 정보 저장
      const hasError = results.some((r) => r === null)
      if (hasError) {
        pendingRetryRef.current = { recipeId: targetRecipeId, thumbnailIndex }
        toast.error('일부 사진 업로드에 실패했습니다. 썸네일의 재시도 버튼을 눌러주세요.')
      }
    },
    [user]
  )

  const handleRetryUpload = useCallback(
    async (index: number) => {
      const retry = pendingRetryRef.current
      const file = photosRef.current.files[index]
      if (!retry || !file || !user) return

      setUploadStates((prev) => {
        const next = [...prev]
        next[index] = 'uploading'
        return next
      })

      const ext = file.name.split('.').pop() ?? 'jpg'
      const safePath = `${user.id}/${retry.recipeId}/${Date.now()}-${index}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(safePath, file, { cacheControl: '3600', contentType: file.type })

      if (uploadError) {
        setUploadStates((prev) => {
          const next = [...prev]
          next[index] = 'error'
          return next
        })
        toast.error('재업로드에 실패했습니다')
        return
      }

      const { data: photoRow, error: insertError } = await supabase
        .from('recipe_photos')
        .insert({ recipe_id: retry.recipeId, storage_path: safePath, order: index })
        .select('id')
        .single()

      if (insertError) {
        setUploadStates((prev) => {
          const next = [...prev]
          next[index] = 'error'
          return next
        })
        toast.error('재업로드에 실패했습니다')
        return
      }

      setUploadStates((prev) => {
        const next = [...prev]
        next[index] = 'done'
        return next
      })

      // 재시도한 것이 썸네일이면 thumbnail_photo_id 갱신
      if (index === retry.thumbnailIndex) {
        await updateRecipe(retry.recipeId, { thumbnail_photo_id: photoRow.id })
      }

      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(retry.recipeId) })
      toast.success('사진이 업로드되었습니다')
    },
    [user, queryClient]
  )

  const onSubmit = useCallback(
    async (values: RecipeFormOutput) => {
      if (!user) {
        toast.error('로그인이 필요합니다')
        return
      }

      setIsSubmitting(true)

      try {
        const { ingredients, oven_temp, bake_time, quantity, preheat_temp, preheat_time, ...rest } =
          values
        const { bakeTimeUnit, preheatTimeUnit } = unitsRef.current
        const recipeData = {
          ...rest,
          oven_temp: oven_temp ? `${oven_temp}°C` : null,
          bake_time: bake_time ? `${bake_time}${bakeTimeUnit}` : null,
          quantity: quantity ? `${quantity}개` : null,
          preheat_temp: preheat_temp ? `${preheat_temp}°C` : null,
          preheat_time: preheat_time ? `${preheat_time}${preheatTimeUnit}` : null,
        }
        const { files, thumbnailIndex } = photosRef.current

        // Build price snapshot map from ingredient master
        let priceMap: Map<string, number> | undefined
        if (ingredients.length > 0) {
          try {
            const masterIngredients = await fetchIngredients()
            priceMap = new Map()
            for (const mi of masterIngredients) {
              if (mi.unit_price != null) {
                priceMap.set(mi.name.trim().toLowerCase(), Number(mi.unit_price))
              }
            }
          } catch {
            // Non-critical: proceed without price snapshots
          }
        }

        if (mode === 'create') {
          const recipe = await createRecipe({
            ...recipeData,
            tags: recipeData.tags ?? [],
            user_id: user.id,
          } as never)

          await Promise.all([
            ingredients.length > 0
              ? supabase
                  .from('recipe_ingredients')
                  .insert(buildIngredientRows(recipe.id, ingredients, priceMap))
                  .then(({ error }) => {
                    if (error) console.error('Ingredient insert failed:', error)
                  })
              : Promise.resolve(),
            files.length > 0 ? uploadPhotos(recipe.id, files, thumbnailIndex) : Promise.resolve(),
          ])

          setIsSaved(true)
          toast.success('레시피가 등록되었습니다')
          queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
          savedTimerRef.current = setTimeout(() => {
            router.navigate({ to: '/recipe/$id', params: { id: recipe.id } })
          }, 350)
        } else if (recipeId) {
          const replaceIngredients = supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', recipeId)
            .then(async () => {
              if (ingredients.length > 0) {
                const { error } = await supabase
                  .from('recipe_ingredients')
                  .insert(buildIngredientRows(recipeId, ingredients, priceMap))
                if (error) console.error('Ingredient insert failed:', error)
              }
            })

          await Promise.all([
            updateRecipe(recipeId, { ...recipeData, tags: recipeData.tags ?? [] }),
            replaceIngredients,
            files.length > 0 ? uploadPhotos(recipeId, files, thumbnailIndex) : Promise.resolve(),
          ])

          setIsSaved(true)
          toast.success('레시피가 수정되었습니다')
          queryClient.invalidateQueries({ queryKey: recipeKeys.detail(recipeId) })
          queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
          formLoaded.current = false
          setPhotosChanged(false)
          setUnitsChanged(false)
          savedTimerRef.current = setTimeout(() => {
            setIsSaved(false)
            setLoadKey((k) => k + 1)
          }, 350)
        }
      } catch (err) {
        console.error('Submit error:', err)
        toast.error(mode === 'create' ? '레시피 등록에 실패했습니다' : '레시피 수정에 실패했습니다')
      } finally {
        setIsSubmitting(false)
      }
    },
    [mode, recipeId, user, router, uploadPhotos, queryClient]
  )

  const isEditUnchanged = mode === 'edit' && !isDirty && !photosChanged && !unitsChanged

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="pb-28">
      <PageHeader title={mode === 'create' ? '레시피 추가' : '레시피 수정'} right={headerRight} />
      <div className="max-w-[720px] mx-auto px-4 pt-6 flex flex-col gap-5">
        <section className="bg-card border border-border rounded-2xl p-6 shadow-(--shadow-card)">
          <CardHeader index={0} />
          {isDataLoading ? (
            <SectionSkeleton />
          ) : (
            <BasicInfoSection control={control} errors={errors} />
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 shadow-(--shadow-card)">
          <CardHeader
            index={1}
            extra={
              !isDataLoading ? (
                <button
                  type="button"
                  onClick={() => appendIngredientRef.current()}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-primary bg-(--primary-dim) border border-(--primary-border) cursor-pointer transition-colors hover:bg-(--primary-border)"
                >
                  <Plus size={12} />
                  재료 추가
                </button>
              ) : null
            }
          />
          {isDataLoading ? (
            <SectionSkeleton />
          ) : (
            <IngredientsSection control={control} errors={errors} onAppendRef={handleAppendRef} />
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 shadow-(--shadow-card)">
          <CardHeader index={2} />
          {isDataLoading ? (
            <SectionSkeleton variant="steps" />
          ) : (
            <StepsSection
              register={register}
              errors={errors}
              bakeTimeUnit={bakeTimeUnit}
              preheatTimeUnit={preheatTimeUnit}
              onBakeTimeUnitChange={(u) => {
                setBakeTimeUnit(u)
                unitsRef.current = { ...unitsRef.current, bakeTimeUnit: u }
                if (mode === 'edit') setUnitsChanged(true)
              }}
              onPreheatTimeUnitChange={(u) => {
                setPreheatTimeUnit(u)
                unitsRef.current = { ...unitsRef.current, preheatTimeUnit: u }
                if (mode === 'edit') setUnitsChanged(true)
              }}
            />
          )}
        </section>

        <section className="bg-card/60 border border-dashed border-border rounded-2xl p-5">
          <CardHeader index={3} />
          <PhotoSection
            onChange={handlePhotoChange}
            uploadStates={uploadStates.length > 0 ? uploadStates : undefined}
            onRetry={handleRetryUpload}
          />
        </section>
      </div>

      {/* Fixed bottom action bar */}
      <div
        className="fixed bottom-0 inset-x-0 z-60 bg-card/85 border-t border-border"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-[720px] mx-auto px-4 h-16 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.history.back()}
            className="shrink-0 text-muted-foreground"
          >
            취소
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || isEditUnchanged || isSaved}
            className={cn('flex-1', isSaved && 'scale-[1.04]')}
          >
            {submitButtonContent({ isSaved, isSubmitting, isEditUnchanged })}
          </Button>
        </div>
      </div>
    </form>
  )
}
