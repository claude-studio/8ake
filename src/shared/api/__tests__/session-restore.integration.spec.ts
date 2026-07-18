import { createClient } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AUTH_STORAGE_KEY, authStorage, setRememberPreference } from '../auth-storage'

import type { SupabaseClient, User } from '@supabase/supabase-js'

const TEST_USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'restore@example.com',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
}

const clients: SupabaseClient[] = []

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function createAccessToken(): string {
  const now = Math.floor(Date.now() / 1000)
  return [
    base64Url({ alg: 'HS256', typ: 'JWT' }),
    base64Url({
      aud: 'authenticated',
      exp: now + 3600,
      iat: now,
      role: 'authenticated',
      sub: TEST_USER.id,
    }),
    'test-signature',
  ].join('.')
}

function createAuthClient(explicitStorageKey: boolean): SupabaseClient {
  const projectRef = AUTH_STORAGE_KEY.replace(/^sb-/, '').replace(/-auth-token$/, '')
  const fetchStub: typeof fetch = async () =>
    new Response(JSON.stringify(TEST_USER), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  const client = createClient(`https://${projectRef}.supabase.co`, 'test-anon-key', {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: authStorage,
      ...(explicitStorageKey ? { storageKey: AUTH_STORAGE_KEY } : {}),
    },
    global: { fetch: fetchStub },
  })
  clients.push(client)
  return client
}

async function writeAndRestoreSession(remember: boolean, backend: Storage) {
  setRememberPreference(remember)
  const writer = createAuthClient(true)
  const accessToken = createAccessToken()

  const { data, error } = await writer.auth.setSession({
    access_token: accessToken,
    refresh_token: 'test-refresh-token',
  })

  expect(error).toBeNull()
  expect(data.session?.user.id).toBe(TEST_USER.id)
  expect(backend.getItem(AUTH_STORAGE_KEY)).not.toBeNull()

  const restored = await createAuthClient(false).auth.getSession()
  expect(restored.error).toBeNull()
  expect(restored.data.session?.access_token).toBe(accessToken)
  expect(restored.data.session?.user.id).toBe(TEST_USER.id)
}

describe('Supabase session restore with authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    for (const client of clients.splice(0)) {
      client.auth.stopAutoRefresh()
    }
  })

  it('remember ON session을 localStorage에 기록하고 새 client가 복원한다', async () => {
    await writeAndRestoreSession(true, localStorage)
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('remember OFF session을 sessionStorage에 기록하고 새 client가 복원한다', async () => {
    await writeAndRestoreSession(false, sessionStorage)
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })

  it('Supabase remove 경로가 양쪽 backend의 동일 session key를 정리한다', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'local-session')
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'tab-session')

    authStorage.removeItem(AUTH_STORAGE_KEY)

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
