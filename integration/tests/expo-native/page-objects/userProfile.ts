import { expect } from 'e2e';

import type { DeviceFixtures } from '../types.ts';
import { tapCenter, tapControl, tapUntilVisible } from './gestures.ts';

export const createUserProfilePageObject = (fixtures: DeviceFixtures) => {
  const { screen } = fixtures;
  const openButton = screen.getByTestId('open-embedded-profile-button');
  const self = {
    open: () => {
      return tapUntilVisible(openButton, screen.getByText('E2E Custom Page'));
    },
    openRow: (name: string) => {
      return tapControl(fixtures, screen.getByText(name));
    },
    back: () => {
      return tapCenter(fixtures, screen.getByLabel('Back').last());
    },
    leaveCustomPage: () => {
      return fixtures.platform === 'android' ? fixtures.device.back() : self.back();
    },
    expectClosed: () => {
      return expect(openButton).toBeVisible({ timeout: 15_000 });
    },
  };
  return self;
};
