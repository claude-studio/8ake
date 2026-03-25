import { create } from 'zustand'

import { supabase } from '@/shared/api'

import type { Session, User } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, isLoading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },
}))
