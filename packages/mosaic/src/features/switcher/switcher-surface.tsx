import React from 'react';

import type { MosaicMessages } from '../../localization';
import { useMessages } from '../../localization';
import type { SwitcherMode } from './switcher.types';

export type SwitcherSurface = 'switcher' | 'user-button' | 'organization-switcher';

export function surfaceForMode(mode: SwitcherMode): SwitcherSurface {
  switch (mode) {
    case 'combined':
      return 'switcher';
    case 'user':
      return 'user-button';
    case 'organization':
      return 'organization-switcher';
  }
}

const SurfaceContext = React.createContext<SwitcherSurface>('switcher');

export const SwitcherSurfaceProvider = SurfaceContext.Provider;

export function useSlot(): (part: string) => string {
  const surface = React.useContext(SurfaceContext);
  return part => `${surface}-${part}`;
}

export type SwitcherMessages = Omit<MosaicMessages['userButton'], 'accounts'> | MosaicMessages['organizationSwitcher'];

export function useSwitcherMessages(): SwitcherMessages {
  const surface = React.useContext(SurfaceContext);
  const userButton = useMessages('userButton');
  const organizationSwitcher = useMessages('organizationSwitcher');
  return surface === 'organization-switcher' ? organizationSwitcher : userButton;
}
