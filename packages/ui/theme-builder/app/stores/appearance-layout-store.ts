import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppearanceLayoutStoreState {
  devMode: 'on' | 'off';
  animations: 'on' | 'off';
}

interface AppearanceLayoutStoreActions {
  setDevMode: (devMode: 'on' | 'off') => void;
  setAnimations: (animations: 'on' | 'off') => void;
  reset: () => void;
}

export const initialState: AppearanceLayoutStoreState = {
  devMode: 'on',
  animations: 'on',
};

export const useAppearanceLayoutStore = create(
  persist<AppearanceLayoutStoreState & AppearanceLayoutStoreActions>(
    set => ({
      ...initialState,
      setDevMode: devMode => set({ devMode }),
      setAnimations: animations => set({ animations }),
      reset: () => set(initialState),
    }),
    {
      name: 'appearance-layout-storage',
    },
  ),
);
