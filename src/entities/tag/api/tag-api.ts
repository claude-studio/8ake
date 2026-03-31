import { supabase } from '@/shared/api'

export const tagKeys = {
  all: ['tags'] as const,
  popular: () => [...tagKeys.all, 'popular'] as const,
}

/** 모든 레시피에서 사용된 태그를 빈도순으로 가져온다 */
export async function fetchPopularTags(limit = 20): Promise<{ tag: string; count: number }[]> {
  const { data, error } = await supabase.from('recipes').select('tags')
  if (error) throw error

  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      countMap.set(tag, (countMap.get(tag) ?? 0) + 1)
    }
  }

  return [...countMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
