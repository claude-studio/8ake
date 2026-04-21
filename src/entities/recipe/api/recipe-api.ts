import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { handleSupabaseError } from '@/shared/lib/handle-error'

import type { RecipeWithDetails } from '../model/types'

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (search: string, sortBy: string, tags?: string[]) =>
    [...recipeKeys.lists(), { search, sortBy, tags }] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
}

export const PAGE_SIZE = 12

type CreatedAtCursor = { created_at: string; id: string }
type TotalScoreCursor = { total_score: number; id: string }
export type RecipeCursor = CreatedAtCursor | TotalScoreCursor

export async function fetchRecipes({
  search,
  sortBy,
  cursor,
  tags,
}: {
  search: string
  sortBy: 'created_at' | 'total_score'
  cursor?: RecipeCursor
  tags?: string[]
}) {
  let query = supabase
    .from('recipes')
    .select('*, recipe_photos!recipe_photos_recipe_id_fkey(id, order, storage_path)')
    .order(sortBy, { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags)
  }

  if (cursor && sortBy === 'created_at' && 'created_at' in cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  } else if (cursor && sortBy === 'total_score' && 'total_score' in cursor) {
    query = query.or(
      `total_score.lt.${cursor.total_score},and(total_score.eq.${cursor.total_score},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) handleSupabaseError(error, '레시피 목록 조회')
  return data ?? []
}

export async function fetchRecipe(id: string): Promise<RecipeWithDetails> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*), recipe_photos!recipe_photos_recipe_id_fkey(*)')
    .eq('id', id)
    .single()

  if (error) handleSupabaseError(error, '레시피 상세 조회')
  // handleSupabaseError는 항상 throw하므로, 여기까지 오면 data는 null이 아님.
  // Supabase select 쿼리가 반환하는 관계 배열 타입(recipe_ingredients, recipe_photos)이
  // RecipeWithDetails 구조와 동일하지만 TS 추론이 정확히 일치하지 않아 assertion 사용.
  return data as RecipeWithDetails
}

export async function createRecipe(values: TablesInsert<'recipes'>) {
  const { data, error } = await supabase.from('recipes').insert(values).select().single()
  if (error) handleSupabaseError(error, '레시피 등록')
  return data
}

export async function updateRecipe(id: string, values: TablesUpdate<'recipes'>) {
  const { data, error } = await supabase
    .from('recipes')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) handleSupabaseError(error, '레시피 수정')
  return data
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) handleSupabaseError(error, '레시피 삭제')
}

const photoUrlCache = new Map<string, string>()

export function getPhotoUrl(storagePath: string): string {
  const cached = photoUrlCache.get(storagePath)
  if (cached) return cached
  const { data } = supabase.storage.from('recipe-photos').getPublicUrl(storagePath)
  photoUrlCache.set(storagePath, data.publicUrl)
  return data.publicUrl
}
