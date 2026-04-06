import { create } from 'zustand'

const UI_STORAGE_KEY = '8ake-ui'

function loadViewMode(): 'card' | 'table' {
  try {
    const saved = localStorage.getItem(UI_STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : null
    return parsed?.ingredientViewMode === 'table' ? 'table' : 'card'
  } catch {
    return 'card'
  }
}

interface UIStore {
  ingredientViewMode: 'card' | 'table'
  setIngredientViewMode: (mode: 'card' | 'table') => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  ingredientViewMode: loadViewMode(),
  setIngredientViewMode: (mode) => {
    if (mode === get().ingredientViewMode) return
    try {
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ ingredientViewMode: mode }))
    } catch {
      // ignore
    }
    set({ ingredientViewMode: mode })
  },
}))
