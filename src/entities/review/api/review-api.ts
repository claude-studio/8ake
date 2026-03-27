import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'

export async function fetchReviews(recipeId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createReview(values: TablesInsert<'reviews'>) {
  const { data, error } = await supabase.from('reviews').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateReview(id: string, values: TablesUpdate<'reviews'>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}
