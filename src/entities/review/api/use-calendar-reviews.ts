import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/shared/api'

import { reviewKeys } from './review-api'

export interface CalendarReview {
  id: string
  date: string
  recipe_id: string
  recipe_name: string
  total_score: number | null
  created_at: string
}

async function fetchCalendarReviews(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('reviews')
    .select('id, date, recipe_id, total_score, created_at, recipes(name)')
    .gte('created_at', startDate)
    .lt('created_at', endDate)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((r) => ({
    id: r.id,
    date: r.date ?? r.created_at.slice(0, 10),
    recipe_id: r.recipe_id,
    recipe_name: (r.recipes as unknown as { name: string })?.name ?? '',
    total_score: r.total_score,
    created_at: r.created_at,
  }))
}

export function useCalendarReviews(year: number, month: number) {
  const query = useQuery({
    queryKey: [...reviewKeys.all, 'calendar', year, month],
    queryFn: () => fetchCalendarReviews(year, month),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
