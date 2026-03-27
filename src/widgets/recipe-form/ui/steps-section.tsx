import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { RecipeFormValues } from '../model/recipe-schema'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface Props {
  register: UseFormRegister<RecipeFormValues>
  errors: FieldErrors<RecipeFormValues>
}

export function StepsSection({ register, errors }: Props) {
  return (
    <div className="space-y-4">
      {/* 오븐온도 / 굽는시간 / 분량 - 3열 */}
      <div className="grid grid-cols-3 gap-[10px] mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            오븐 온도 <span className="text-destructive">*</span>
          </label>
          <Input
            {...register('oven_temp')}
            type="text"
            placeholder="180°C"
            className="text-center"
            aria-invalid={!!errors.oven_temp}
          />
          {errors.oven_temp && (
            <p className="text-xs mt-2 text-destructive">{errors.oven_temp.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            굽는 시간 <span className="text-destructive">*</span>
          </label>
          <Input
            {...register('bake_time')}
            type="text"
            placeholder="25분"
            className="text-center"
            aria-invalid={!!errors.bake_time}
          />
          {errors.bake_time && (
            <p className="text-xs mt-2 text-destructive">{errors.bake_time.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            분량 <span className="text-destructive">*</span>
          </label>
          <Input
            {...register('quantity')}
            type="text"
            placeholder="12개"
            className="text-center"
            aria-invalid={!!errors.quantity}
          />
          {errors.quantity && (
            <p className="text-xs mt-2 text-destructive">{errors.quantity.message}</p>
          )}
        </div>
      </div>

      {/* 만드는 법 - ruled textarea */}
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
        {errors.steps && <p className="text-xs mt-2 text-destructive">{errors.steps.message}</p>}
      </div>

      {/* 메모 - dashed textarea */}
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
