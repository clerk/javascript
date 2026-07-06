import { describe, expect, it } from 'vitest';

import * as experimental from '../index';

/**
 * The experimental entry must expose the composed profile API as flat named
 * exports (not a namespace object like `UserProfile.Account`). Flat names are
 * what let consumers render these inside a React Server Component tree without
 * adding their own `'use client'` boundary — each named export of a `'use client'`
 * module becomes its own client reference, whereas property access on a namespace
 * object does not.
 */

const EXPECTED_EXPORTS = [
  // Providers
  'UserProfileProvider',
  'OrganizationProfileProvider',
  // UserProfile panels
  'UserProfileAccountPanel',
  'UserProfileSecurityPanel',
  'UserProfileBillingPanel',
  'UserProfileAPIKeysPanel',
  // UserProfile account sections
  'UserProfileProfileSection',
  'UserProfileUsernameSection',
  'UserProfileEmailSection',
  'UserProfilePhoneSection',
  'UserProfileConnectedAccountsSection',
  'UserProfileEnterpriseAccountsSection',
  'UserProfileWeb3Section',
  // UserProfile security sections
  'UserProfilePasswordSection',
  'UserProfilePasskeysSection',
  'UserProfileMfaSection',
  'UserProfileActiveDevicesSection',
  'UserProfileDeleteSection',
  // OrganizationProfile panels
  'OrganizationProfileGeneralPanel',
  'OrganizationProfileMembersPanel',
  'OrganizationProfileBillingPanel',
  'OrganizationProfileAPIKeysPanel',
  'OrganizationProfileConfigureSSOPanel',
  // OrganizationProfile general sections
  'OrganizationProfileProfileSection',
  'OrganizationProfileDomainsSection',
  'OrganizationProfileLeaveSection',
  'OrganizationProfileDeleteSection',
] as const;

describe('@clerk/ui/experimental flat exports', () => {
  for (const name of EXPECTED_EXPORTS) {
    it(`exports ${name} as a component`, () => {
      expect(typeof (experimental as Record<string, unknown>)[name]).toBe('function');
    });
  }

  it('does not export the compound namespace objects', () => {
    expect((experimental as Record<string, unknown>).UserProfile).toBeUndefined();
    expect((experimental as Record<string, unknown>).OrganizationProfile).toBeUndefined();
  });
});
