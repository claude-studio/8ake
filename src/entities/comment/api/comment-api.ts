import { z } from 'zod'

import { supabase } from '@/shared/api'
import type { TablesInsert, TablesUpdate } from '@/shared/api/database.types'
import { handleSupabaseError } from '@/shared/lib/handle-error'

import { recipeCommentSchema } from '../model/types'

import type { RecipeComment } from '../model/types'

export const PAGE_SIZE = 20

export const commentKeys = {
  all: ['recipe_comments'] as const,
  list: (recipeId: string) => [...commentKeys.all, 'list', recipeId] as const,
  infinite: (recipeId: string) => [...commentKeys.all, 'infinite', recipeId] as const,
  count: (recipeId: string) => [...commentKeys.all, 'count', recipeId] as const,
}

export interface CommentCursor {
  created_at: string
  id: string
}

export interface CommentsPage {
  comments: RecipeComment[]
  nextCursor: CommentCursor | null
}

export async function fetchComments({
  recipeId,
  limit = PAGE_SIZE,
  cursor = null,
}: {
  recipeId: string
  limit?: number
  cursor?: CommentCursor | null
}): Promise<CommentsPage> {
  let query = supabase
    .from('recipe_comments')
    .select('*, profiles(email)')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit)

  if (cursor) {
    query = query.or(
      `created_at.gt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.gt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) handleSupabaseError(error, '댓글 목록 조회')

  const comments = z.array(recipeCommentSchema).parse(
    (data ?? []).map((row) => ({
      ...row,
      author_email: (row.profiles as { email?: string } | null)?.email ?? null,
      profiles: undefined,
    }))
  )

  const lastComment = comments.length === limit ? (comments[comments.length - 1] ?? null) : null
  const nextCursor = lastComment ? { created_at: lastComment.created_at, id: lastComment.id } : null

  return { comments, nextCursor }
}

export async function fetchCommentsCount(recipeId: string): Promise<number> {
  const { count, error } = await supabase
    .from('recipe_comments')
    .select('*', { count: 'exact', head: true })
    .eq('recipe_id', recipeId)
  if (error) handleSupabaseError(error, '댓글 수 조회')
  return count ?? 0
}

export async function createComment(
  values: TablesInsert<'recipe_comments'>
): Promise<RecipeComment> {
  const { data, error } = await supabase
    .from('recipe_comments')
    .insert(values)
    .select('*, profiles(email)')
    .single()
  if (error) handleSupabaseError(error, '댓글 등록')
  const row = data as typeof data & { profiles: { email?: string } | null }
  return recipeCommentSchema.parse({
    ...row,
    author_email: row?.profiles?.email ?? null,
    profiles: undefined,
  })
}

export async function updateComment(
  id: string,
  values: TablesUpdate<'recipe_comments'>
): Promise<RecipeComment> {
  const { data, error } = await supabase
    .from('recipe_comments')
    .update(values)
    .eq('id', id)
    .select('*, profiles(email)')
    .single()
  if (error) handleSupabaseError(error, '댓글 수정')
  const row = data as typeof data & { profiles: { email?: string } | null }
  return recipeCommentSchema.parse({
    ...row,
    author_email: row?.profiles?.email ?? null,
    profiles: undefined,
  })
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('recipe_comments').delete().eq('id', id)
  if (error) handleSupabaseError(error, '댓글 삭제')
}
