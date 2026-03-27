import { Controller, useFieldArray } from 'react-hook-form'

import { Input } from '@/components/ui/input'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { Control, FieldErrors } from 'react-hook-form'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<RecipeFormValues, any, any>
  errors: FieldErrors<RecipeFormValues>
  onAppendRef?: (fn: () => void) => void
}

export function IngredientsSection({ control, errors, onAppendRef }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  // append 함수를 부모에 노출
  if (onAppendRef) onAppendRef(() => append({ name: '', amount: '' }))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid items-start gap-2 grid-cols-[1fr_120px_36px] animate-[slideDown_0.2s_ease]"
          >
            {/* 재료명 */}
            <Controller
              control={control}
              name={`ingredients.${index}.name`}
              render={({ field: f }) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    {...f}
                    type="text"
                    placeholder="재료명"
                    className="h-8 text-sm"
                    aria-invalid={!!errors.ingredients?.[index]?.name}
                  />
                  {errors.ingredients?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.ingredients[index].name?.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* 양 */}
            <Controller
              control={control}
              name={`ingredients.${index}.amount`}
              render={({ field: f }) => (
                <div className="flex flex-col gap-1.5">
                  <Input
                    {...f}
                    value={f.value ?? ''}
                    type="text"
                    placeholder="양 *"
                    className="h-8 text-sm"
                    aria-invalid={!!errors.ingredients?.[index]?.amount}
                  />
                  {errors.ingredients?.[index]?.amount && (
                    <p className="text-xs text-destructive">
                      {errors.ingredients[index].amount?.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="btn-delete size-8 rounded-[6px] border-[1.5px] border-border bg-surface flex items-center justify-center cursor-pointer text-muted-foreground text-base shrink-0 transition-all duration-150"
              title="삭제"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Array-level error */}
      {(errors.ingredients?.root || errors.ingredients?.message) && (
        <p className="text-xs mt-1 text-destructive">
          {errors.ingredients?.root?.message ?? errors.ingredients?.message}
        </p>
      )}
    </div>
  )
}
