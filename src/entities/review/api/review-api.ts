import { z } from 'zod'

import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { handleSupabaseError } from '@/shared/lib/handle-error'

const ReviewRow = z.object({
  id: z.string(),
  created_at: z.string(),
  ingredient_id: z.string(),
  memo: z.string().nullable(),
  purchase_place: z.string().nullable(),
  score: z.number().nullable(),
  user_id: z.string(),
})

export type ReviewRow = z.infer<typeof ReviewRow>

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (recipeId: string) => [...reviewKeys.all, 'list', recipeId] as const,
}

export async function fetchReviews(recipeId: string): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
  if (error) handleSupabaseError(error, '회고 목록 조회')
  return z.array(ReviewRow).parse(data ?? [])
}

export async function createReview(values: TablesInsert<'reviews'>) {
  const { data, error } = await supabase.from('reviews').insert(values).select().single()
  if (error) handleSupabaseError(error, '회고 등록')
  return data
}

export async function updateReview(id: string, values: TablesUpdate<'reviews'>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) handleSupabaseError(error, '회고 수정')
  return data
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) handleSupabaseError(error, '회고 삭제')
}
