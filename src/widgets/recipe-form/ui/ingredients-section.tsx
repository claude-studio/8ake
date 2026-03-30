import { memo, useEffect } from 'react'

import { Trash2 } from 'lucide-react'
import { Controller, useFieldArray } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/shared/lib/utils'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { Control, FieldErrors } from 'react-hook-form'

type IngredientUnit = RecipeFormValues['ingredients'][number]['unit']

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<RecipeFormValues, any, any>
  errors: FieldErrors<RecipeFormValues>
  onAppendRef?: (fn: () => void) => void
}

interface IngredientRowProps {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<RecipeFormValues, any, any>
  errors: FieldErrors<RecipeFormValues>
  canDelete: boolean
  onRemove: () => void
}

const IngredientRow = memo(function IngredientRow({
  index,
  control,
  errors,
  canDelete,
  onRemove,
}: IngredientRowProps) {
  return (
    <div className="flex flex-col gap-2 min-[475px]:grid min-[475px]:grid-cols-[1fr_140px_32px] min-[475px]:items-start animate-[slideDown_0.2s_ease]">
      {/* 행1: 재료명 (모바일 full / 데스크탑 1열) */}
      <Controller
        control={control}
        name={`ingredients.${index}.name`}
        render={({ field: f }) => (
          <div className="flex flex-col gap-1.5">
            <Input
              {...f}
              type="text"
              placeholder="재료명 *"
              className="h-8 text-sm"
              aria-invalid={!!errors.ingredients?.[index]?.name}
            />
            {errors.ingredients?.[index]?.name && (
              <p className="text-xs text-destructive">{errors.ingredients[index].name?.message}</p>
            )}
          </div>
        )}
      />

      {/* 행2(모바일): 수량+단위 + 삭제버튼 한 행 / 데스크탑: 각각 2열·3열 */}
      <Controller
        control={control}
        name={`ingredients.${index}.unit`}
        render={({ field: unitField }) => (
          <Controller
            control={control}
            name={`ingredients.${index}.amount`}
            render={({ field: amountField }) => {
              const hasAmountError = !!errors.ingredients?.[index]?.amount
              return (
                <div className="flex gap-2 min-[475px]:contents">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div
                      className={cn('flex h-8 rounded-md border overflow-hidden', {
                        'border-destructive outline outline-[3px] outline-destructive/20':
                          hasAmountError,
                        'border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15':
                          !hasAmountError,
                      })}
                    >
                      <Input
                        {...amountField}
                        value={amountField.value ?? ''}
                        type={unitField.value === '직접입력' ? 'text' : 'number'}
                        placeholder={unitField.value === '직접입력' ? '직접입력' : '0'}
                        className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0 text-sm"
                        aria-invalid={hasAmountError}
                      />
                      <div
                        className={cn('relative flex h-full flex-none border-l', {
                          'border-destructive': hasAmountError,
                          'border-input': !hasAmountError,
                        })}
                      >
                        <NativeSelect
                          value={unitField.value}
                          onChange={(e) => {
                            unitField.onChange(e.target.value as IngredientUnit)
                            // 직접입력 → 숫자 모드 전환 시 비숫자 값 초기화
                            if (e.target.value !== '직접입력') {
                              const val = amountField.value
                              if (val && isNaN(Number(val))) amountField.onChange('')
                            }
                          }}
                          className="h-full w-[48px] flex-none rounded-none rounded-r-md border-0 pl-2 pr-4 py-0 text-[11px] font-semibold text-gray-800 dark:text-gray-200 bg-surface focus:ring-0 shadow-none cursor-pointer hover:bg-primary/8 transition-colors"
                        >
                          <NativeSelectOption value="g">g</NativeSelectOption>
                          <NativeSelectOption value="개">개</NativeSelectOption>
                          <NativeSelectOption value="직접입력">직접</NativeSelectOption>
                        </NativeSelect>
                      </div>
                    </div>
                    {hasAmountError && (
                      <p className="text-xs text-destructive">
                        {errors.ingredients![index]!.amount?.message}
                      </p>
                    )}
                  </div>

                  {/* 삭제버튼: 모바일에서는 수량 행 끝에, 데스크탑에서는 3열 */}
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canDelete}
                    className="size-8 flex items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed shrink-0 self-start"
                    title="삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            }}
          />
        )}
      />
    </div>
  )
})

export function IngredientsSection({ control, errors, onAppendRef }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  })

  useEffect(() => {
    onAppendRef?.(() => append({ name: '', amount: '', unit: 'g' }))
  }, [onAppendRef, append])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col">
        {fields.map((field, index) => (
          <div key={field.id}>
            {index > 0 && <div className="border-t border-dashed border-border my-3" />}
            <IngredientRow
              index={index}
              control={control}
              errors={errors}
              canDelete={fields.length > 1}
              onRemove={() => remove(index)}
            />
          </div>
        ))}
      </div>

      {(errors.ingredients?.root || errors.ingredients?.message) && (
        <p className="text-xs mt-1 text-destructive">
          {errors.ingredients?.root?.message ?? errors.ingredients?.message}
        </p>
      )}
    </div>
  )
}
