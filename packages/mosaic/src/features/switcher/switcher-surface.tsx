import React from 'react';

import type { MosaicMessages } from '../../localization';
import { useMessages } from '../../localization';
import type { SwitcherMode } from './switcher.types';

export type SwitcherSurface = 'user-button' | 'organization-switcher';

export function surfaceForMode(mode: SwitcherMode): SwitcherSurface {
  return mode === 'organization' ? 'organization-switcher' : 'user-button';
}

const SurfaceContext = React.createContext<SwitcherSurface>('user-button');

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
