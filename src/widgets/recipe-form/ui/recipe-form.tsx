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
import { RecipeSchema, type RecipeFormValues } from '../model/recipe-schema'

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
}

const STEP_LABELS = ['기본정보', '재료', '만드는 법', '사진', '회고'] as const

const noteCardStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
  boxShadow: 'var(--shadow-card)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
}

function CardHeader({ index, extra }: { index: number; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
      <div className="flex items-center gap-2">
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-dim)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          {index + 1}
        </span>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--foreground)',
            margin: 0,
          }}
        >
          {STEP_LABELS[index]}
        </h2>
        {index === 4 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--muted-foreground)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '2px 7px',
            }}
          >
            선택사항
          </span>
        )}
      </div>
      {extra}
    </div>
  )
}

export function RecipeForm({ mode, recipeId }: Props) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photosChanged, setPhotosChanged] = useState(false)
  const formLoaded = useRef(false)

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
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      name: '',
      source_type: undefined,
      source_url: '',
      oven_temp: '',
      bake_time: '',
      quantity: '',
      steps: '',
      memo: '',
      tags: [],
      is_public: false,
      ingredients: [{ name: '', amount: '' }],
    },
  })

  const appendIngredientRef = useRef<() => void>(() => {})

  const handleAppendRef = useCallback((fn: () => void) => {
    appendIngredientRef.current = fn
  }, [])

  // Load existing recipe for edit mode
  useEffect(() => {
    if (mode !== 'edit' || !recipeId || formLoaded.current) return

    async function load() {
      try {
        const recipe = await fetchRecipe(recipeId!)
        formLoaded.current = true
        reset({
          name: recipe.name,
          source_type: (recipe.source_type as RecipeFormValues['source_type']) ?? undefined,
          source_url: recipe.source_url ?? '',
          oven_temp: recipe.oven_temp ?? '',
          bake_time: recipe.bake_time ?? '',
          quantity: recipe.quantity ?? '',
          steps: recipe.steps ?? '',
          memo: recipe.memo ?? '',
          tags: recipe.tags ?? [],
          is_public: recipe.is_public,
          ingredients:
            recipe.recipe_ingredients.length > 0
              ? recipe.recipe_ingredients.map((ri) => ({
                  name: ri.name,
                  amount: ri.amount ?? '',
                }))
              : [{ name: '', amount: '' }],
        })
      } catch {
        toast.error('레시피를 불러오는데 실패했습니다')
      }
    }

    load()
  }, [mode, recipeId, reset])

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
        const { ingredients, ...recipeData } = values
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
                  .insert(
                    ingredients.map((ing, i) => ({
                      recipe_id: recipe.id,
                      name: ing.name,
                      amount: ing.amount || null,
                      order: i,
                    }))
                  )
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
          await updateRecipe(recipeId, {
            ...recipeData,
            tags: recipeData.tags ?? [],
          })

          // Replace ingredients: delete existing, insert new
          await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

          if (ingredients.length > 0) {
            const { error: ingError } = await supabase.from('recipe_ingredients').insert(
              ingredients.map((ing, i) => ({
                recipe_id: recipeId,
                name: ing.name,
                amount: ing.amount || null,
                order: i,
              }))
            )
            if (ingError) console.error('Ingredient insert failed:', ingError)
          }

          // Upload new photos (if any)
          if (files.length > 0) {
            await uploadPhotos(recipeId, files, thumbnailIndex)
          }

          toast.success('레시피가 수정되었습니다')
          window.dispatchEvent(new Event('recipe-updated'))
          router.navigate({ to: '/recipe/$id', params: { id: recipeId } })
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
      <PageHeader title={mode === 'create' ? '레시피 추가' : '레시피 수정'} />
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '20px 16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Section 1: Basic Info */}
        <section className="note-card-accent" style={noteCardStyle}>
          <CardHeader index={0} />
          <BasicInfoSection control={control} errors={errors} />
        </section>

        {/* Section 2: Ingredients */}
        <section className="note-card-accent" style={noteCardStyle}>
          <CardHeader
            index={1}
            extra={
              <button
                type="button"
                onClick={() => appendIngredientRef.current()}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-dim)',
                  border: '1px solid var(--primary-border)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} />
                재료 추가
              </button>
            }
          />
          <IngredientsSection control={control} errors={errors} onAppendRef={handleAppendRef} />
        </section>

        {/* Section 3: Steps */}
        <section className="note-card-accent" style={noteCardStyle}>
          <CardHeader index={2} />
          <StepsSection register={register} errors={errors} />
        </section>

        {/* Section 4: Photos */}
        <section className="note-card-accent" style={noteCardStyle}>
          <CardHeader index={3} />
          <PhotoSection onChange={handlePhotoChange} />
        </section>

        {/* Section 5: Retrospective */}
        <section className="note-card-accent" style={noteCardStyle}>
          <CardHeader index={4} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            레시피 저장 후 상세 페이지에서 베이킹 기록을 추가할 수 있어요.
          </p>
        </section>
      </div>

      {/* Fixed bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[60]"
        style={{
          height: 64,
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '0 16px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {/* 취소 */}
          <Button type="button" variant="outline" onClick={() => router.history.back()}>
            취소
          </Button>

          {/* 저장 */}
          <Button
            type="submit"
            disabled={isSubmitting || (mode === 'edit' && !isDirty && !photosChanged)}
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
