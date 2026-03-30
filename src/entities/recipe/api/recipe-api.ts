import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'

import type { RecipeWithDetails } from '../model/types'

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (search: string, sortBy: string) => [...recipeKeys.lists(), { search, sortBy }] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
}

export const PAGE_SIZE = 12

export async function fetchRecipes({
  search,
  sortBy,
  cursor,
}: {
  search: string
  sortBy: 'created_at' | 'total_score'
  cursor?: { created_at: string; id: string }
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

  // cursor pagination은 created_at 정렬 시에만 유효
  if (cursor && sortBy === 'created_at') {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchRecipe(id: string): Promise<RecipeWithDetails> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_ingredients(*), recipe_photos!recipe_photos_recipe_id_fkey(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  // Supabase returns related rows as arrays when using wildcard select
  return data as unknown as RecipeWithDetails
}

export async function createRecipe(values: TablesInsert<'recipes'>) {
  const { data, error } = await supabase.from('recipes').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateRecipe(id: string, values: TablesUpdate<'recipes'>) {
  const { data, error } = await supabase
    .from('recipes')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

export function getPhotoUrl(storagePath: string) {
  const { data } = supabase.storage.from('recipe-photos').getPublicUrl(storagePath)
  return data.publicUrl
}
