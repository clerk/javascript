import { expect } from 'e2e';

import type { DeviceFixtures } from '../types.ts';
import { tapControl } from './gestures.ts';

export const createUserButtonPageObject = (fixtures: DeviceFixtures) => {
  const { screen } = fixtures;
  const self = {
    open: async () => {
      await screen.getByLabel(/^Open (account|user profile)$/).tap();
      await expect(screen.getByText('Manage account')).toBeVisible({ timeout: 15_000 });
    },
    signOut: () => {
      return tapControl(fixtures, screen.getByText('Sign out'));
    },
  };
  return self;
};
