import { supabase } from '@/shared/api/supabase-client'

export async function getTotalRecipeCount() {
  const { data } = await supabase.from('recipes').select('id')
  return data?.length ?? 0
}
