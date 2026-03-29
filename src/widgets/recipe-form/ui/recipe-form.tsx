import { useCallback, useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { Loader2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { createRecipe, updateRecipe, fetchRecipe } from '@/entities/recipe'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/shared/api'
import { PageHeader } from '@/shared/ui'

import { BasicInfoSection } from './basic-info-section'
import { IngredientsSection } from './ingredients-section'
import { PhotoSection } from './photo-section'
import { StepsSection } from './steps-section'
import { RecipeSchemaRefined, type RecipeFormValues } from '../model/recipe-schema'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
  headerRight?: React.ReactNode
}

const STEP_LABELS = ['기본정보', '재료', '만드는 법', '사진'] as const

function CardHeader({
  index,
  extra,
  required,
}: {
  index: number
  extra?: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-(--primary-dim) border border-(--primary-border) flex items-center justify-center text-[11px] font-bold text-primary">
          {index + 1}
        </span>
        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-foreground m-0">
          {STEP_LABELS[index]}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </h2>
      </div>
      {extra}
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

function buildIngredientRows(recipeId: string, ingredients: RecipeFormValues['ingredients']) {
  return ingredients.map((ing, i) => ({
    recipe_id: recipeId,
    name: ing.name,
    amount:
      ing.unit === '직접입력' ? ing.amount || null : ing.amount ? `${ing.amount}${ing.unit}` : null,
    order: i,
  }))
}

export function RecipeForm({ mode, recipeId, headerRight }: Props) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photosChanged, setPhotosChanged] = useState(false)
  const [unitsChanged, setUnitsChanged] = useState(false)
  const [loadKey, setLoadKey] = useState(0)
  const [bakeTimeUnit, setBakeTimeUnit] = useState<'분' | '시간'>('분')
  const [preheatTimeUnit, setPreheatTimeUnit] = useState<'분' | '시간'>('분')
  const formLoaded = useRef(false)

  const unitsRef = useRef<{ bakeTimeUnit: string; preheatTimeUnit: string }>({
    bakeTimeUnit: '분',
    preheatTimeUnit: '분',
  })

  // Photos managed outside react-hook-form to avoid type conflicts
  const photosRef = useRef<{ files: File[]; thumbnailIndex: number }>({
    files: [],
    thumbnailIndex: 0,
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(RecipeSchemaRefined),
    defaultValues: {
      name: '',
      source_type: undefined,
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
      if (mode === 'edit') setPhotosChanged(true)
    },
    [mode]
  )

  const uploadPhotos = useCallback(
    async (targetRecipeId: string, files: File[], thumbnailIndex: number) => {
      if (!user || files.length === 0) return

      const uploadOne = async (file: File, i: number): Promise<string | null> => {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const safePath = `${user.id}/${targetRecipeId}/${Date.now()}-${i}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('recipe-photos')
          .upload(safePath, file)

        if (uploadError) {
          console.error('Photo upload failed:', uploadError)
          return null
        }

        const { data: photoRow, error: insertError } = await supabase
          .from('recipe_photos')
          .insert({ recipe_id: targetRecipeId, storage_path: safePath, order: i })
          .select('id')
          .single()

        if (insertError) {
          console.error('Photo record insert failed:', insertError)
          return null
        }

        return photoRow.id
      }

      const results = await Promise.all(files.map((file, i) => uploadOne(file, i)))
      const photoIds = results.filter((id): id is string => id !== null)

      if (photoIds.length > 0 && photoIds[thumbnailIndex]) {
        await updateRecipe(targetRecipeId, { thumbnail_photo_id: photoIds[thumbnailIndex] })
      }
    },
    [user]
  )

  const onSubmit = useCallback(
    async (values: RecipeFormValues) => {
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
                  .insert(buildIngredientRows(recipe.id, ingredients))
                  .then(({ error }) => {
                    if (error) console.error('Ingredient insert failed:', error)
                  })
              : Promise.resolve(),
            files.length > 0 ? uploadPhotos(recipe.id, files, thumbnailIndex) : Promise.resolve(),
          ])

          toast.success('레시피가 등록되었습니다')
          window.dispatchEvent(new Event('recipe-updated'))
          router.navigate({ to: '/recipe/$id', params: { id: recipe.id } })
        } else if (recipeId) {
          const replaceIngredients = supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', recipeId)
            .then(async () => {
              if (ingredients.length > 0) {
                const { error } = await supabase
                  .from('recipe_ingredients')
                  .insert(buildIngredientRows(recipeId, ingredients))
                if (error) console.error('Ingredient insert failed:', error)
              }
            })

          await Promise.all([
            updateRecipe(recipeId, { ...recipeData, tags: recipeData.tags ?? [] }),
            replaceIngredients,
            files.length > 0 ? uploadPhotos(recipeId, files, thumbnailIndex) : Promise.resolve(),
          ])

          toast.success('레시피가 수정되었습니다')
          window.dispatchEvent(new Event('recipe-updated'))
          formLoaded.current = false
          setPhotosChanged(false)
          setUnitsChanged(false)
          setLoadKey((k) => k + 1)
        }
      } catch (err) {
        console.error('Submit error:', err)
        toast.error(mode === 'create' ? '레시피 등록에 실패했습니다' : '레시피 수정에 실패했습니다')
      } finally {
        setIsSubmitting(false)
      }
    },
    [mode, recipeId, user, router, uploadPhotos]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="pb-24">
      <PageHeader title={mode === 'create' ? '레시피 추가' : '레시피 수정'} right={headerRight} />
      <div className="max-w-[720px] mx-auto px-4 pt-5 flex flex-col gap-5">
        {/* Section 1: Basic Info */}
        <section className="note-card-accent bg-card border border-border rounded-xl p-6 shadow-(--shadow-card) relative overflow-hidden">
          <CardHeader index={0} />
          <BasicInfoSection control={control} errors={errors} />
        </section>

        {/* Section 2: Ingredients */}
        <section className="note-card-accent bg-card border border-border rounded-xl p-6 shadow-(--shadow-card) relative overflow-hidden">
          <CardHeader
            index={1}
            required
            extra={
              <button
                type="button"
                onClick={() => appendIngredientRef.current()}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-primary bg-(--primary-dim) border border-(--primary-border) cursor-pointer"
              >
                <Plus size={12} />
                재료 추가
              </button>
            }
          />
          <IngredientsSection control={control} errors={errors} onAppendRef={handleAppendRef} />
        </section>

        {/* Section 3: Steps */}
        <section className="note-card-accent bg-card border border-border rounded-xl p-6 shadow-(--shadow-card) relative overflow-hidden">
          <CardHeader index={2} />
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
        </section>

        {/* Section 4: Photos */}
        <section className="note-card-accent bg-card border border-border rounded-xl p-6 shadow-(--shadow-card) relative overflow-hidden">
          <CardHeader index={3} />
          <PhotoSection onChange={handlePhotoChange} />
        </section>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-60 h-16 bg-card border-t border-border shadow-(--shadow-md)">
        <div className="max-w-[720px] mx-auto px-4 h-full flex items-center justify-between gap-[10px]">
          {/* 취소 */}
          <Button type="button" variant="outline" onClick={() => router.history.back()}>
            취소
          </Button>

          {/* 저장 */}
          <Button
            type="submit"
            disabled={
              isSubmitting || (mode === 'edit' && !isDirty && !photosChanged && !unitsChanged)
            }
            className="min-w-[100px]"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </form>
  )
}
