import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { fieldLabelStyle } from './form-styles'

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
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}
      >
        <div>
          <label style={fieldLabelStyle}>
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
        <div>
          <label style={fieldLabelStyle}>
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
        <div>
          <label style={fieldLabelStyle}>
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
      <div>
        <label style={fieldLabelStyle}>
          만드는 법 <span className="text-destructive">*</span>
        </label>
        <Textarea
          {...register('steps')}
          rows={8}
          placeholder={`1. 버터를 녹인다\n2. 밀가루를 섞는다\n...`}
          aria-invalid={!!errors.steps}
          style={{
            resize: 'vertical',
            lineHeight: 1.8,
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent calc(1.8em - 1px), var(--border) calc(1.8em - 1px), var(--border) calc(1.8em))',
            backgroundSize: '100% 1.8em',
          }}
        />
        {errors.steps && <p className="text-xs mt-2 text-destructive">{errors.steps.message}</p>}
      </div>

      {/* 메모 - dashed textarea */}
      <div>
        <label style={fieldLabelStyle}>메모</label>
        <Textarea
          {...register('memo')}
          rows={3}
          placeholder="팁이나 변형 방법 등 자유롭게 메모하세요..."
          className="form-input-memo"
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  )
}
