import { create } from 'zustand';

interface AppearanceStoreState {
  appearance: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  devMode: 'on' | 'off';
  animations: 'on' | 'off';
}

interface AppearanceStoreActions {
  setAppearance: (appearance: 'light' | 'dark') => void;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  setDevMode: (devMode: 'on' | 'off') => void;
  setAnimations: (animations: 'on' | 'off') => void;
  reset: () => void;
}

const initialState: AppearanceStoreState = {
  appearance: 'light',
  direction: 'ltr',
  devMode: 'on',
  animations: 'on',
};

export const useAppearanceStore = create<AppearanceStoreState & AppearanceStoreActions>(set => ({
  ...initialState,
  setAppearance: appearance => set({ appearance }),
  setDirection: direction => set({ direction }),
  setDevMode: devMode => set({ devMode }),
  setAnimations: animations => set({ animations }),
  reset: () => set(initialState),
}));
