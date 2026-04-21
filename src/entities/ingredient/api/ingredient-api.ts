import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { AppError } from '@/shared/lib/api-error'
import { handleSupabaseError } from '@/shared/lib/handle-error'

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
  if (error) handleSupabaseError(error, '재료 목록 조회')
  return data ?? []
}

export async function createIngredient(
  name: string,
  userId: string,
  pricing?: { unitPrice: number; priceUnit: string }
) {
  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      name,
      user_id: userId,
      ...(pricing && {
        unit_price: pricing.unitPrice,
        price_unit: pricing.priceUnit,
        price_updated_at: new Date().toISOString(),
      }),
    })
    .select()
    .single()
  if (error) handleSupabaseError(error, '재료 등록')
  if (!data) throw new AppError('재료 등록 후 데이터를 가져올 수 없습니다')
  return data
}

export async function updateIngredientPrice(
  id: string,
  unitPrice: number | null,
  priceUnit: string | null
) {
  const { data, error } = await supabase
    .from('ingredients')
    .update({
      unit_price: unitPrice,
      price_unit: priceUnit,
      price_updated_at: unitPrice !== null ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) handleSupabaseError(error, '재료 단가 수정')
  if (!data) throw new AppError('재료 단가 수정 후 데이터를 가져올 수 없습니다')
  return data
}

export async function deleteIngredient(id: string) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id)
  if (error) handleSupabaseError(error, '재료 삭제')
}

export async function fetchIngredientReviews(ingredientId: string) {
  const { data, error } = await supabase
    .from('ingredient_reviews')
    .select('*')
    .eq('ingredient_id', ingredientId)
    .order('created_at', { ascending: false })
  if (error) handleSupabaseError(error, '재료 리뷰 조회')
  return data ?? []
}

export async function createIngredientReview(values: TablesInsert<'ingredient_reviews'>) {
  const { data, error } = await supabase.from('ingredient_reviews').insert(values).select().single()
  if (error) handleSupabaseError(error, '재료 리뷰 등록')
  if (!data) throw new AppError('재료 리뷰 등록 후 데이터를 가져올 수 없습니다')
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
  if (error) handleSupabaseError(error, '재료 리뷰 수정')
  if (!data) throw new AppError('재료 리뷰 수정 후 데이터를 가져올 수 없습니다')
  return data
}

export async function deleteIngredientReview(id: string) {
  const { error } = await supabase.from('ingredient_reviews').delete().eq('id', id)
  if (error) handleSupabaseError(error, '재료 리뷰 삭제')
}
