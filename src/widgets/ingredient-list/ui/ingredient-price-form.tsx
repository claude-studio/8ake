import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRICE_UNITS = ['원/g', '원/ml', '원/개'] as const

interface Props {
  defaultUnitPrice?: number | null
  defaultPriceUnit?: string | null
  onSubmit: (unitPrice: number | null, priceUnit: string | null) => void
  onCancel: () => void
}

export function IngredientPriceForm({
  defaultUnitPrice,
  defaultPriceUnit,
  onSubmit,
  onCancel,
}: Props) {
  const [unitPrice, setUnitPrice] = useState(defaultUnitPrice?.toString() ?? '')
  const [priceUnit, setPriceUnit] = useState(defaultPriceUnit ?? '원/g')

  function handleSubmit() {
    const price = unitPrice.trim() ? Number(unitPrice) : null
    if (price !== null && (isNaN(price) || price < 0)) return
    onSubmit(price, price !== null ? priceUnit : null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          placeholder="단가"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') onCancel()
          }}
          autoFocus
          className="flex-1 text-sm"
        />
        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {PRICE_UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setPriceUnit(unit)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                priceUnit === unit
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="xs" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button size="xs" onClick={handleSubmit}>
          저장
        </Button>
      </div>
    </div>
  )
}
