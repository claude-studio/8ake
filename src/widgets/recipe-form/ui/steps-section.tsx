import { ChevronDown } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/lib/utils'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

type TimeUnit = '분' | '시간'

interface Props {
  register: UseFormRegister<RecipeFormValues>
  errors: FieldErrors<RecipeFormValues>
  bakeTimeUnit: TimeUnit
  preheatTimeUnit: TimeUnit
  onBakeTimeUnitChange: (u: TimeUnit) => void
  onPreheatTimeUnitChange: (u: TimeUnit) => void
}

function UnitSelect({
  value,
  onChange,
  hasError,
}: {
  value: TimeUnit
  onChange: (u: TimeUnit) => void
  hasError?: boolean
}) {
  return (
    <div
      className={cn('relative flex h-full flex-none border-l', {
        'border-destructive': hasError,
        'border-input': !hasError,
      })}
    >
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.target.value as TimeUnit)}
        className="h-full w-[44px] flex-none rounded-none rounded-r-md border-0 pl-1 pr-4 py-0 text-[11px] font-semibold text-gray-800 dark:text-gray-200 bg-surface focus:ring-0 shadow-none cursor-pointer hover:bg-primary/8 transition-colors"
      >
        <NativeSelectOption value="분">분</NativeSelectOption>
        <NativeSelectOption value="시간">시간</NativeSelectOption>
      </NativeSelect>
      <ChevronDown
        size={10}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

function FixedUnit({ unit, hasError }: { unit: string; hasError?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-full items-center rounded-r-md border-l bg-surface px-2.5 text-[11px] font-semibold text-foreground',
        { 'border-destructive': hasError, 'border-input': !hasError }
      )}
    >
      {unit}
    </div>
  )
}

export function StepsSection({
  register,
  errors,
  bakeTimeUnit,
  preheatTimeUnit,
  onBakeTimeUnitChange,
  onPreheatTimeUnitChange,
}: Props) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-[10px]">
        <div className="flex flex-col gap-1.5">
          <label className="field-label">예열 온도</label>
          <div className="flex h-9 rounded-md border border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('preheat_temp')}
              type="number"
              placeholder="0"
              className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            <FixedUnit unit="°C" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">예열 시간</label>
          <div className="flex h-9 rounded-md border border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('preheat_time')}
              type="number"
              placeholder="0"
              className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            <UnitSelect value={preheatTimeUnit} onChange={onPreheatTimeUnitChange} />
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-border my-4" />

      <div className="grid grid-cols-2 gap-[10px] min-[475px]:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            오븐 온도 <span className="text-destructive">*</span>
          </label>
          <div
            className={cn('flex h-9 rounded-md border overflow-hidden', {
              'border-destructive outline outline-[3px] outline-destructive/20': !!errors.oven_temp,
              'border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15':
                !errors.oven_temp,
            })}
          >
            <Input
              {...register('oven_temp')}
              type="number"
              placeholder="0"
              className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.oven_temp}
            />
            <FixedUnit unit="°C" hasError={!!errors.oven_temp} />
          </div>
          {errors.oven_temp && (
            <p className="text-xs text-destructive">{errors.oven_temp.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            굽는 시간 <span className="text-destructive">*</span>
          </label>
          <div
            className={cn('flex h-9 rounded-md border overflow-hidden', {
              'border-destructive outline outline-[3px] outline-destructive/20': !!errors.bake_time,
              'border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15':
                !errors.bake_time,
            })}
          >
            <Input
              {...register('bake_time')}
              type="number"
              placeholder="0"
              className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.bake_time}
            />
            <UnitSelect
              value={bakeTimeUnit}
              onChange={onBakeTimeUnitChange}
              hasError={!!errors.bake_time}
            />
          </div>
          {errors.bake_time && (
            <p className="text-xs text-destructive">{errors.bake_time.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 col-span-2 min-[475px]:col-span-1">
          <label className="field-label">
            분량 <span className="text-destructive">*</span>
          </label>
          <div
            className={cn('flex h-9 rounded-md border overflow-hidden', {
              'border-destructive outline outline-[3px] outline-destructive/20': !!errors.quantity,
              'border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15':
                !errors.quantity,
            })}
          >
            <Input
              {...register('quantity')}
              type="number"
              placeholder="0"
              className="h-full flex-1 min-w-0 border-0 rounded-l-md rounded-r-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.quantity}
            />
            <FixedUnit unit="개" hasError={!!errors.quantity} />
          </div>
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      <div className="border-t border-dashed border-border my-4" />

      <div className="flex flex-col gap-1.5">
        <label className="field-label">
          만드는 법 <span className="text-destructive">*</span>
        </label>
        <Textarea
          {...register('steps')}
          placeholder={`1. 버터를 녹인다\n2. 밀가루를 섞는다\n...`}
          aria-invalid={!!errors.steps}
          className="ruled-lines-textarea min-h-[250px]"
        />
        {errors.steps && <p className="text-xs text-destructive">{errors.steps.message}</p>}
      </div>

      <div className="border-t border-dashed border-border my-4" />

      <div className="flex flex-col gap-1.5">
        <label className="field-label">메모</label>
        <Textarea
          {...register('memo')}
          placeholder="팁이나 변형 방법 등 자유롭게 메모하세요..."
          className="form-input-memo resize-y min-h-[130px]"
        />
      </div>
    </div>
  )
}
