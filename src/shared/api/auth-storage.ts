/**
 * Preference-routed auth storage for a single Supabase client.
 * Remember-me ON → localStorage; OFF → sessionStorage.
 * storageKey stays the supabase-js default derived from project URL.
 */

const REMEMBER_PREFERENCE_KEY = '8ake-auth-remember'

/** Same rule as @supabase/supabase-js: sb-${hostname first label}-auth-token */
export function deriveAuthStorageKey(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname
  const ref = hostname.split('.')[0] ?? 'unknown'
  return `sb-${ref}-auth-token`
}

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''

/** Shared exact key used by createClient + cleanup helpers (no prefix scan). */
export const AUTH_STORAGE_KEY = envUrl ? deriveAuthStorageKey(envUrl) : 'sb-unknown-auth-token'

const AUTH_KEY_SUFFIXES = ['-code-verifier', '-user'] as const

export function getAuthRelatedKeys(mainKey: string = AUTH_STORAGE_KEY): string[] {
  return [mainKey, ...AUTH_KEY_SUFFIXES.map((s) => `${mainKey}${s}`)]
}

export function getRememberPreference(): boolean {
  try {
    const raw = localStorage.getItem(REMEMBER_PREFERENCE_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

export function setRememberPreference(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_PREFERENCE_KEY, remember ? 'true' : 'false')
  } catch {
    // ignore quota / private mode
  }
}

function preferredBackend(): Storage {
  return getRememberPreference() ? localStorage : sessionStorage
}

/**
 * Supabase SupportedStorage adapter.
 * - getItem: preferred backend only (no fallback)
 * - setItem: preferred backend only (does not clear opposite)
 * - removeItem: both backends
 */
export const authStorage = {
  getItem(key: string): string | null {
    try {
      return preferredBackend().getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      preferredBackend().setItem(key, value)
    } catch {
      // ignore
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

/** Remove only AUTH_STORAGE_KEY + known suffixes from the opposite backend of current preference. */
export function clearOppositeBackend(): void {
  const opposite = getRememberPreference() ? sessionStorage : localStorage
  for (const key of getAuthRelatedKeys()) {
    try {
      opposite.removeItem(key)
    } catch {
      // ignore
    }
  }
}

/** Clear auth keys on both backends (tab-local sessionStorage + shared localStorage). */
export function clearAllAuthStorage(): void {
  for (const key of getAuthRelatedKeys()) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(key)
    } catch {
      // ignore
    }
  }
}

/**
 * Boot-time legacy safety: if both backends hold different main tokens and no
 * explicit preference flag, wipe both and force re-auth.
 */
export function resolveAmbiguousLegacySessions(): void {
  try {
    const hasFlag = localStorage.getItem(REMEMBER_PREFERENCE_KEY) !== null
    if (hasFlag) return

    const localToken = localStorage.getItem(AUTH_STORAGE_KEY)
    const sessionToken = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (localToken && sessionToken && localToken !== sessionToken) {
      clearAllAuthStorage()
    }
  } catch {
    // ignore
  }
}
