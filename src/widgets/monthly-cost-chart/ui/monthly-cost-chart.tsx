import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Coins } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { supabase } from '@/shared/api'

const monthlyCostKeys = {
  all: ['monthly-costs'] as const,
  list: (months: number) => [...monthlyCostKeys.all, months] as const,
}

const AMOUNT_RE = /^(\d+(?:\.\d+)?)/

interface MonthlyData {
  month: string
  cost: number
  count: number
}

async function fetchMonthlyCosts(months: number): Promise<MonthlyData[]> {
  const since = new Date()
  since.setMonth(since.getMonth() - months + 1)
  since.setDate(1)
  const sinceStr = since.toISOString().slice(0, 10)

  // Get reviews (baking records) with their recipe's ingredients
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('date, recipe_id')
    .gte('date', sinceStr)
    .order('date', { ascending: true })

  if (error) throw error
  if (!reviews?.length) return []

  // Get unique recipe IDs
  const recipeIds = [...new Set(reviews.map((r) => r.recipe_id))]

  // Fetch recipe_ingredients with price snapshots for these recipes
  const { data: ingredients, error: ingError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id, amount, unit_price_snapshot')
    .in('recipe_id', recipeIds)

  if (ingError) throw ingError

  // Calculate cost per recipe
  const recipeCostMap = new Map<string, number>()
  for (const ing of ingredients ?? []) {
    if (ing.unit_price_snapshot == null || !ing.amount) continue
    const match = ing.amount.match(AMOUNT_RE)
    if (!match) continue
    const cost = parseFloat(match[1]) * Number(ing.unit_price_snapshot)
    recipeCostMap.set(ing.recipe_id, (recipeCostMap.get(ing.recipe_id) ?? 0) + cost)
  }

  // Aggregate by month
  const monthMap = new Map<string, { cost: number; count: number }>()
  for (const review of reviews) {
    if (!review.date) continue
    const month = review.date.slice(0, 7) // YYYY-MM
    const entry = monthMap.get(month) ?? { cost: 0, count: 0 }
    entry.count += 1
    entry.cost += recipeCostMap.get(review.recipe_id) ?? 0
    monthMap.set(month, entry)
  }

  // Fill missing months
  const result: MonthlyData[] = []
  const cursor = new Date(since)
  const now = new Date()
  while (cursor <= now) {
    const key = cursor.toISOString().slice(0, 7)
    const entry = monthMap.get(key)
    result.push({
      month: `${cursor.getMonth() + 1}월`,
      cost: Math.round(entry?.cost ?? 0),
      count: entry?.count ?? 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
}

export function MonthlyCostChart() {
  const [months] = useState(6)
  const { data, isLoading } = useQuery({
    queryKey: monthlyCostKeys.list(months),
    queryFn: () => fetchMonthlyCosts(months),
  })

  const totalCost = useMemo(() => data?.reduce((sum, d) => sum + d.cost, 0) ?? 0, [data])
  const totalCount = useMemo(() => data?.reduce((sum, d) => sum + d.count, 0) ?? 0, [data])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">비용 데이터 불러오는 중...</p>
      </div>
    )
  }

  if (!data?.length || totalCost === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins size={16} className="text-primary" />
          <span className="text-sm font-bold text-foreground">월별 베이킹 비용</span>
        </div>
        <p className="text-sm text-muted-foreground">
          아직 비용 데이터가 없습니다. 재료에 단가를 등록하고 베이킹 기록을 추가해 보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-primary" />
          <span className="text-sm font-bold text-foreground">월별 베이킹 비용</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {months}개월 · {totalCount}회
          </span>
          <span className="text-sm font-bold text-primary">{totalCost.toLocaleString()}원</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()}원`, '비용']}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
            }}
          />
          <Bar dataKey="cost" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
