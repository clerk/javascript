import type { SwitcherSurface } from '../../components/switcher/switcher.context';
import { useSwitcherSurface } from '../../components/switcher/switcher.context';
import type { MosaicMessages } from '../../localization';
import { useMessages } from '../../localization';
import type { SwitcherMode } from './switcher.types';

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

export type SwitcherMessages = Omit<MosaicMessages['userButton'], 'accounts'> | MosaicMessages['organizationSwitcher'];

export function useSwitcherMessages(): SwitcherMessages {
  const surface = useSwitcherSurface();
  const userButton = useMessages('userButton');
  const organizationSwitcher = useMessages('organizationSwitcher');
  return surface === 'organization-switcher' ? organizationSwitcher : userButton;
}
