import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'grayscale';

interface AccessibilityState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: 'normal' | 'large';
  toggleFontSize: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      fontSize: 'normal',
      toggleFontSize: () => set((state) => ({ fontSize: state.fontSize === 'normal' ? 'large' : 'normal' })),
    }),
    {
      name: 'accessibility-storage',
    }
  )
);
