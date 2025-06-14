import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SignInStatus } from '@clerk/types';

type SignInUIState = {
  // Status
  status: SignInStatus | null;

  // Error handling
  error: {
    global: string | null;
    fields: Record<string, string>;
  };

  // Data
  identifier: string | null;
  createdSessionId: string | null;
  supportedFirstFactors: any[] | null;
  supportedSecondFactors: any[] | null;

  // Actions
  setStatus: (status: SignInStatus | null) => void;
  setError: (error: Partial<SignInUIState['error']>) => void;
  clearError: () => void;
  reset: () => void;
  set: (state: Partial<Omit<SignInUIState, 'setStatus' | 'setError' | 'clearError' | 'reset' | 'set'>>) => void;
};

export const useSignInStore = create<SignInUIState>()(
  devtools(
    set => ({
      // Initial state
      status: null,
      error: { global: null, fields: {} },
      identifier: null,
      createdSessionId: null,
      supportedFirstFactors: null,
      supportedSecondFactors: null,

      // Actions
      setStatus: status => set({ status }),
      setError: error =>
        set(state => ({
          error: { ...state.error, ...error },
        })),
      clearError: () => set({ error: { global: null, fields: {} } }),
      reset: () =>
        set({
          status: null,
          error: { global: null, fields: {} },
          identifier: null,
          createdSessionId: null,
          supportedFirstFactors: null,
          supportedSecondFactors: null,
        }),
      set: newState => set(state => ({ ...state, ...newState })),
    }),
    { name: 'SignInStore' },
  ),
);
