import { create } from 'zustand'

interface ThemeStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set) => {
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
  const initial = saved ?? 'light'
  document.documentElement.setAttribute('data-theme', initial)

  return {
    theme: initial,
    toggleTheme: () =>
      set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.add('theme-transitioning')
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning')
        }, 250)
        return { theme: next }
      }),
  }
})
