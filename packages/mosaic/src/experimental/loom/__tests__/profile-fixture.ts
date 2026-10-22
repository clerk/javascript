import type { ProfileSettings } from '@clerk/loom';

export const profileSettings: ProfileSettings = {
  firstName: { enabled: true, required: false },
  lastName: { enabled: true, required: false },
  username: { enabled: true, required: false, immutable: false, usedForFirstFactor: false, usedForSecondFactor: false },
  emailAddress: {
    enabled: true,
    required: true,
    immutable: false,
    usedForFirstFactor: true,
    usedForSecondFactor: false,
  },
  passwordEnabled: true,
  enterpriseSsoEnabled: false,
  providers: [
    { strategy: 'oauth_github', enabled: true, name: 'GitHub', logoUrl: null },
    { strategy: 'oauth_google', enabled: true, name: 'Google', logoUrl: null },
    { strategy: 'oauth_x', enabled: true, name: 'X', logoUrl: null },
  ],
};
