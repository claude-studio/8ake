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

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 120px 36px',
  gap: 8,
  alignItems: 'start',
  animation: 'slideDown 0.2s ease',
}

const deleteBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: '1.5px solid var(--border)',
  backgroundColor: 'var(--surface)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--muted-foreground)',
  fontSize: 16,
  flexShrink: 0,
  transition: 'all 0.15s',
}

export function IngredientsSection({ control, errors, onAppendRef }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  // append 함수를 부모에 노출
  if (onAppendRef) onAppendRef(() => append({ name: '', amount: '' }))

  return (
    <div>
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} style={rowStyle}>
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
              className="btn-delete"
              style={deleteBtnStyle}
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
