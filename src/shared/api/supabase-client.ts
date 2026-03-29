import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
  },
})

/**
 * rememberMe=false 시 localStorage 대신 sessionStorage를 사용하는 임시 클라이언트.
 * 로그인 완료 후 버려지므로 앱 전체 인스턴스와 충돌하지 않는다.
 */
export function createLoginClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: sessionStorage,
    },
  })
}
