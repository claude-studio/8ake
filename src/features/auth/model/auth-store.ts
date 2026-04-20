import { create } from 'zustand'

import { supabase } from '@/shared/api'
import { toastSupabaseError } from '@/shared/lib/handle-error'

import type { Session, User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

// 구독은 앱 생명주기 동안 단 1회만 등록
let authListenerRegistered = false

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false }),
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) toastSupabaseError(error, '로그아웃')
    } finally {
      set({ user: null, session: null })
    }
  },
  initialize: async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) toastSupabaseError(error, '세션 초기화')
      set({ session: data.session, user: data.session?.user ?? null, isLoading: false })

      if (!authListenerRegistered) {
        authListenerRegistered = true
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null })
        })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
