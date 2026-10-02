import type { DeviceFixtures } from '../types.ts';
import { createAppPageObject } from './app.ts';
import { createAuthViewPageObject } from './authView.ts';
import { createUserButtonPageObject } from './userButton.ts';
import { createUserProfilePageObject } from './userProfile.ts';

export const createPageObjects = (fixtures: DeviceFixtures) => {
  return {
    app: createAppPageObject(fixtures),
    authView: createAuthViewPageObject(fixtures),
    userButton: createUserButtonPageObject(fixtures),
    userProfile: createUserProfilePageObject(fixtures),
  };
};

export type PageObjects = ReturnType<typeof createPageObjects>;
