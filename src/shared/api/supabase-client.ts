import { createClient } from '@supabase/supabase-js'

import { AUTH_STORAGE_KEY, authStorage, resolveAmbiguousLegacySessions } from './auth-storage'

import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Prefer safe boot if both storages hold conflicting legacy tokens
resolveAmbiguousLegacySessions()

/**
 * App-wide singleton. Session persistence is routed by remember-me preference
 * via authStorage (localStorage when ON, sessionStorage when OFF).
 * A single client owns login, restore, and app-wide authenticated requests.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: authStorage,
    storageKey: AUTH_STORAGE_KEY,
  },
})
