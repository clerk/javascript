import { createContext } from 'react';

export type StrategiesContextValue = {
  current: string | undefined; // TODO: Update type
  isActive: (name: string) => boolean;
  preferred: string | undefined; // TODO: Update type
};

export const StrategiesContext = createContext<StrategiesContextValue>({
  current: undefined,
  isActive: _name => false,
  preferred: undefined,
});
