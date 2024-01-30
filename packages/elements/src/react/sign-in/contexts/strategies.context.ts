import type { SignInStrategy } from '@clerk/types';
import { createContext } from 'react';

export type StrategiesContextValue = {
  current: SignInStrategy | undefined;
  isActive: (name: string) => boolean;
  preferred: SignInStrategy | undefined;
};

export const StrategiesContext = createContext<StrategiesContextValue>({
  current: undefined,
  isActive: _name => false,
  preferred: undefined,
});
