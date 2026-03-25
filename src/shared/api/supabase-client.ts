import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Remember me OFF → sessionStorage (탭 종료 시 세션 만료)
export function createSupabaseClient(rememberMe: boolean = true) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: rememberMe ? localStorage : sessionStorage,
      persistSession: true,
    },
  })
}

// 기본 클라이언트 (Remember me ON)
export const supabase = createSupabaseClient(true)
