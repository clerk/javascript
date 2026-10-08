import { localizationKeys } from '../../localization';

export const userButtonMessages = {
  trigger: {
    open: localizationKeys('userButton.action__openUserMenu'),
    close: localizationKeys('userButton.action__closeUserMenu'),
  },
  popup: {
    label: localizationKeys('userButton.label__userButtonPopover'),
  },
  accounts: {
    actions: localizationKeys('userButton.label__accountActions'),
    sessions: localizationKeys('userButton.label__activeSessions'),
    manage: localizationKeys('userButton.action__manageAccount'),
    add: localizationKeys('userButton.action__addAccount'),
    signOut: localizationKeys('userButton.action__signOut'),
    signOutAll: localizationKeys('userButton.action__signOutAll'),
  },
} as const;
