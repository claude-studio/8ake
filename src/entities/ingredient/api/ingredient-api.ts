import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'

export const ingredientKeys = {
  all: ['ingredients'] as const,
  list: () => [...ingredientKeys.all, 'list'] as const,
  reviews: (ingredientId: string) => [...ingredientKeys.all, 'reviews', ingredientId] as const,
}

export async function fetchIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createIngredient(name: string, userId: string) {
  const { data, error } = await supabase
    .from('ingredients')
    .insert({ name, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteIngredient(id: string) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id)
  if (error) throw error
}

export async function fetchIngredientReviews(ingredientId: string) {
  const { data, error } = await supabase
    .from('ingredient_reviews')
    .select('*')
    .eq('ingredient_id', ingredientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createIngredientReview(values: TablesInsert<'ingredient_reviews'>) {
  const { data, error } = await supabase.from('ingredient_reviews').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateIngredientReview(
  id: string,
  values: TablesUpdate<'ingredient_reviews'>
) {
  const { data, error } = await supabase
    .from('ingredient_reviews')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteIngredientReview(id: string) {
  const { error } = await supabase.from('ingredient_reviews').delete().eq('id', id)
  if (error) throw error
}
