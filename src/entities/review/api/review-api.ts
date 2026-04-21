import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { AppError } from '@/shared/lib/api-error'
import { handleSupabaseError } from '@/shared/lib/handle-error'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (recipeId: string) => [...reviewKeys.all, 'list', recipeId] as const,
}

export async function fetchReviews(recipeId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
  if (error) handleSupabaseError(error, '회고 목록 조회')
  return data ?? []
}

export async function createReview(values: TablesInsert<'reviews'>) {
  const { data, error } = await supabase.from('reviews').insert(values).select().single()
  if (error) handleSupabaseError(error, '회고 등록')
  if (!data) throw new AppError('회고 등록 후 데이터를 가져올 수 없습니다')
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
  if (!data) throw new AppError('회고 수정 후 데이터를 가져올 수 없습니다')
  return data
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) handleSupabaseError(error, '회고 삭제')
}
