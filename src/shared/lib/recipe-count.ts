import { supabase } from '@/shared/api'

export async function getTotalRecipeCount() {
  const { count, error } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
