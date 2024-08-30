import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppearanceStoreState {
  appearance: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
}

interface AppearanceStoreActions {
  setAppearance: (appearance: 'light' | 'dark') => void;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  reset: () => void;
}

export const initialState: AppearanceStoreState = {
  appearance: 'light',
  direction: 'ltr',
};

export const useThemeBuilderStore = create(
  persist<AppearanceStoreState & AppearanceStoreActions>(
    set => ({
      ...initialState,
      setAppearance: appearance => set({ appearance }),
      setDirection: direction => set({ direction }),
      reset: () => set(initialState),
    }),
    {
      name: 'theme-builder-storage',
    },
  ),
);
