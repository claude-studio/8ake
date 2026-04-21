import { supabase } from '@/shared/api'

import { handleSupabaseError } from './handle-error'

export async function getTotalRecipeCount() {
  const { count, error } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
  if (error) handleSupabaseError(error, '레시피 총 개수 조회')
  return count ?? 0
}
