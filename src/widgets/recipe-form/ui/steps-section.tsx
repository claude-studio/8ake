import { useState } from 'react'

import { ChevronDown } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/lib/utils'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface Props {
  register: UseFormRegister<RecipeFormValues>
  errors: FieldErrors<RecipeFormValues>
  onUnitsChange: (units: { bakeTimeUnit: string; preheatTimeUnit: string }) => void
}

type TimeUnit = '분' | '시간'

interface UnitButtonProps {
  units: TimeUnit[]
  value: TimeUnit
  onChange?: (unit: TimeUnit) => void
}

function UnitButton({ units, value, onChange }: UnitButtonProps) {
  const isToggleable = units.length > 1

  return (
    <button
      type="button"
      onClick={() => {
        if (!isToggleable || !onChange) return
        const idx = units.indexOf(value)
        onChange(units[(idx + 1) % units.length])
      }}
      className={cn(
        'flex h-full items-center gap-0.5 rounded-r-md border-l border-input bg-surface px-2.5 text-[12px] font-semibold text-muted-foreground transition-colors',
        isToggleable ? 'cursor-pointer hover:bg-accent hover:text-foreground' : 'cursor-default'
      )}
    >
      {value}
      {isToggleable && <ChevronDown size={11} className="opacity-60" />}
    </button>
  )
}

interface FixedUnitProps {
  unit: string
}

function FixedUnit({ unit }: FixedUnitProps) {
  return (
    <div className="flex h-full items-center rounded-r-md border-l border-input bg-surface px-2.5 text-[12px] font-semibold text-muted-foreground">
      {unit}
    </div>
  )
}

export function StepsSection({ register, errors, onUnitsChange }: Props) {
  const [bakeTimeUnit, setBakeTimeUnit] = useState<TimeUnit>('분')
  const [preheatTimeUnit, setPreheatTimeUnit] = useState<TimeUnit>('분')

  const handleBakeTimeUnit = (u: TimeUnit) => {
    setBakeTimeUnit(u)
    onUnitsChange({ bakeTimeUnit: u, preheatTimeUnit })
  }

  const handlePreheatTimeUnit = (u: TimeUnit) => {
    setPreheatTimeUnit(u)
    onUnitsChange({ bakeTimeUnit, preheatTimeUnit: u })
  }

  return (
    <div className="space-y-4">
      {/* 1행: 예열 온도 / 예열 시간 (optional) */}
      <div className="grid grid-cols-2 gap-[10px]">
        {/* 예열 온도 */}
        <div className="flex flex-col gap-1.5">
          <label className="field-label">예열 온도</label>
          <div className="flex h-9 rounded-md border border-input overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('preheat_temp')}
              type="number"
              placeholder="220"
              className="h-full flex-1 min-w-0 border-0 rounded-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            <FixedUnit unit="°C" />
          </div>
        </div>

        {/* 예열 시간 */}
        <div className="flex flex-col gap-1.5">
          <label className="field-label">예열 시간</label>
          <div className="flex h-9 rounded-md border border-input overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('preheat_time')}
              type="number"
              placeholder="20"
              className="h-full flex-1 min-w-0 border-0 rounded-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
            />
            <UnitButton
              units={['분', '시간']}
              value={preheatTimeUnit}
              onChange={handlePreheatTimeUnit}
            />
          </div>
        </div>
      </div>

      {/* 2행: 오븐 온도 / 굽는 시간 / 분량 */}
      <div className="grid grid-cols-3 gap-[10px]">
        {/* 오븐 온도 */}
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            오븐 온도 <span className="text-destructive">*</span>
          </label>
          <div className="flex h-9 rounded-md border border-input overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('oven_temp')}
              type="number"
              placeholder="180"
              className="h-full flex-1 min-w-0 border-0 rounded-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.oven_temp}
            />
            <FixedUnit unit="°C" />
          </div>
          {errors.oven_temp && (
            <p className="text-xs text-destructive">{errors.oven_temp.message}</p>
          )}
        </div>

        {/* 굽는 시간 */}
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            굽는 시간 <span className="text-destructive">*</span>
          </label>
          <div className="flex h-9 rounded-md border border-input overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('bake_time')}
              type="number"
              placeholder="25"
              className="h-full flex-1 min-w-0 border-0 rounded-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.bake_time}
            />
            <UnitButton units={['분', '시간']} value={bakeTimeUnit} onChange={handleBakeTimeUnit} />
          </div>
          {errors.bake_time && (
            <p className="text-xs text-destructive">{errors.bake_time.message}</p>
          )}
        </div>

        {/* 분량 */}
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            분량 <span className="text-destructive">*</span>
          </label>
          <div className="flex h-9 rounded-md border border-input overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
            <Input
              {...register('quantity')}
              type="number"
              placeholder="12"
              className="h-full flex-1 min-w-0 border-0 rounded-none text-center shadow-none focus-visible:ring-0 focus-visible:border-0"
              aria-invalid={!!errors.quantity}
            />
            <FixedUnit unit="개" />
          </div>
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      {/* 만드는 법 */}
      <div className="flex flex-col gap-1.5">
        <label className="field-label">
          만드는 법 <span className="text-destructive">*</span>
        </label>
        <Textarea
          {...register('steps')}
          rows={8}
          placeholder={`1. 버터를 녹인다\n2. 밀가루를 섞는다\n...`}
          aria-invalid={!!errors.steps}
          className="ruled-lines-textarea"
        />
        {errors.steps && <p className="text-xs text-destructive">{errors.steps.message}</p>}
      </div>

      {/* 메모 */}
      <div className="flex flex-col gap-1.5">
        <label className="field-label">메모</label>
        <Textarea
          {...register('memo')}
          rows={3}
          placeholder="팁이나 변형 방법 등 자유롭게 메모하세요..."
          className="form-input-memo resize-y"
        />
      </div>
    </div>
  )
}
