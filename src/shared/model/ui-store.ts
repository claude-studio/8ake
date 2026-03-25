import { create } from 'zustand'

interface UIStore {
  ingredientViewMode: 'card' | 'table'
  setIngredientViewMode: (mode: 'card' | 'table') => void
}

export const useUIStore = create<UIStore>((set) => ({
  ingredientViewMode: 'card',
  setIngredientViewMode: (mode) => set({ ingredientViewMode: mode }),
}))
