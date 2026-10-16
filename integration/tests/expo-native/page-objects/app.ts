import { expect } from 'e2e';

import type { DeviceFixtures } from '../types.ts';

export const createAppPageObject = ({ app, device, platform, screen }: DeviceFixtures) => {
  const self = {
    reset: async () => {
      await app.open();
      if (platform === 'ios') {
        await device.clearKeychain();
      }
      await app.clearState();
      await expect(screen.getByText(/^signed (in|out)$/)).toBeVisible({ timeout: 45_000 });
      await self.expectSignedOut();
    },
    expectSignedIn: async () => {
      await expect(screen.getByText('signed in')).toBeVisible({ timeout: 45_000 });
      await expect(screen.getByTestId('user-id')).toBeVisible();
    },
    expectSignedOut: () => {
      return expect(screen.getByText('signed out')).toBeVisible({ timeout: 20_000 });
    },
    signOut: async () => {
      await screen.getByTestId('sign-out-button').tap();
      await self.expectSignedOut();
    },
  };
  return self;
};
