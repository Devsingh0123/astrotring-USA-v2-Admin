import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/lib/constants'

const applyThemeToDom = (themeValue) => {
  if (typeof window === 'undefined') return
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(themeValue)
  localStorage.setItem(STORAGE_KEYS.THEME, themeValue)
}

const initialTheme =
  (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.THEME)) ||
  'dark'

applyThemeToDom(initialTheme)

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: initialTheme,
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
      applyThemeToDom(state.theme)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      applyThemeToDom(state.theme)
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
