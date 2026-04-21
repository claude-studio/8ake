import { z } from 'zod'

import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { handleSupabaseError } from '@/shared/lib/handle-error'

import { recipeCommentSchema } from '../model/types'

import type { RecipeComment } from '../model/types'

export const commentKeys = {
  all: ['recipe_comments'] as const,
  list: (recipeId: string) => [...commentKeys.all, 'list', recipeId] as const,
}

export async function fetchComments(recipeId: string): Promise<RecipeComment[]> {
  const { data, error } = await supabase
    .from('recipe_comments')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: true })
  if (error) handleSupabaseError(error, '댓글 목록 조회')
  return z.array(recipeCommentSchema).parse(data ?? [])
}

export async function createComment(
  values: TablesInsert<'recipe_comments'>
): Promise<RecipeComment> {
  const { data, error } = await supabase.from('recipe_comments').insert(values).select().single()
  if (error) handleSupabaseError(error, '댓글 등록')
  return recipeCommentSchema.parse(data)
}

export async function updateComment(
  id: string,
  values: TablesUpdate<'recipe_comments'>
): Promise<RecipeComment> {
  const { data, error } = await supabase
    .from('recipe_comments')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) handleSupabaseError(error, '댓글 수정')
  return recipeCommentSchema.parse(data)
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('recipe_comments').delete().eq('id', id)
  if (error) handleSupabaseError(error, '댓글 삭제')
}
