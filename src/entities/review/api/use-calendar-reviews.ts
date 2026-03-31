import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/shared/api'

export interface CalendarEntry {
  id: string
  date: string
  type: 'recipe' | 'review'
  recipe_id: string
  recipe_name: string
  total_score: number | null
  created_at: string
}

async function fetchCalendarEntries(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  // 레시피와 리뷰를 병렬로 가져오기
  const [recipesResult, reviewsResult] = await Promise.all([
    supabase
      .from('recipes')
      .select('id, name, created_at')
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
    supabase
      .from('reviews')
      .select('id, date, recipe_id, total_score, created_at, recipes(name)')
      .gte('created_at', startDate)
      .lt('created_at', endDate)
      .order('created_at', { ascending: true }),
  ])

  if (recipesResult.error) throw recipesResult.error
  if (reviewsResult.error) throw reviewsResult.error

  const entries: CalendarEntry[] = []

  // 레시피 생성 = 베이킹 기록
  for (const r of recipesResult.data ?? []) {
    entries.push({
      id: r.id,
      date: r.created_at.slice(0, 10),
      type: 'recipe',
      recipe_id: r.id,
      recipe_name: r.name,
      total_score: null,
      created_at: r.created_at,
    })
  }

  // 리뷰 = 회고 기록
  for (const r of reviewsResult.data ?? []) {
    entries.push({
      id: r.id,
      date: r.date ?? r.created_at.slice(0, 10),
      type: 'review',
      recipe_id: r.recipe_id,
      recipe_name: (r.recipes as unknown as { name: string })?.name ?? '',
      total_score: r.total_score,
      created_at: r.created_at,
    })
  }

  return entries.sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function useCalendarEntries(year: number, month: number) {
  const query = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarEntries(year, month),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

/** @deprecated use useCalendarEntries instead */
export type CalendarReview = CalendarEntry
/** @deprecated use useCalendarEntries instead */
export const useCalendarReviews = useCalendarEntries
