import { describe, expect, it } from 'vitest';

import type { Clerk, EnvironmentResource } from '@/types';

import { disabledSelfServeDirectorySyncFeature, disabledSelfServeSSOFeature } from '../componentGuards';

type Flags = {
  selfServeSSO?: boolean;
  selfServeDirectorySync?: boolean;
  orgSSO?: boolean;
  orgDirectorySync?: boolean;
};

const setup = ({
  selfServeSSO = true,
  selfServeDirectorySync = true,
  orgSSO = false,
  orgDirectorySync = false,
}: Flags) => {
  const clerk = {
    organization: { selfServeSSOEnabled: orgSSO, selfServeDirectorySyncEnabled: orgDirectorySync },
  } as unknown as Clerk;
  const environment = {
    userSettings: {
      enterpriseSSO: {
        enabled: true,
        self_serve_sso: selfServeSSO,
        self_serve_directory_sync: selfServeDirectorySync,
      },
    },
  } as unknown as EnvironmentResource;
  return [clerk, environment] as const;
};

describe('disabledSelfServeSSOFeature', () => {
  it('is enabled when the instance and the organization allow self-serve SSO', () => {
    expect(disabledSelfServeSSOFeature(...setup({ orgSSO: true }))).toBe(false);
  });

  it('is disabled when the organization does not allow self-serve SSO', () => {
    expect(disabledSelfServeSSOFeature(...setup({ orgSSO: false, orgDirectorySync: true }))).toBe(true);
  });

  it('is disabled when the instance does not allow self-serve SSO', () => {
    expect(disabledSelfServeSSOFeature(...setup({ selfServeSSO: false, orgSSO: true }))).toBe(true);
  });
});

describe('disabledSelfServeDirectorySyncFeature', () => {
  it('is enabled when the organization allows Directory Sync, even without self-serve SSO', () => {
    expect(disabledSelfServeDirectorySyncFeature(...setup({ orgSSO: false, orgDirectorySync: true }))).toBe(false);
  });

  it('is enabled when the organization allows both SSO and Directory Sync', () => {
    expect(disabledSelfServeDirectorySyncFeature(...setup({ orgSSO: true, orgDirectorySync: true }))).toBe(false);
  });

  it('is disabled when the organization allows SSO but not Directory Sync', () => {
    expect(disabledSelfServeDirectorySyncFeature(...setup({ orgSSO: true, orgDirectorySync: false }))).toBe(true);
  });

  it('is disabled when the instance does not allow self-serve SSO', () => {
    expect(disabledSelfServeDirectorySyncFeature(...setup({ selfServeSSO: false, orgDirectorySync: true }))).toBe(true);
  });

  it('is disabled when the instance does not allow self-serve Directory Sync', () => {
    expect(
      disabledSelfServeDirectorySyncFeature(...setup({ selfServeDirectorySync: false, orgDirectorySync: true })),
    ).toBe(true);
  });

  it('is disabled without an active organization', () => {
    const [, environment] = setup({});
    expect(disabledSelfServeDirectorySyncFeature({ organization: null } as unknown as Clerk, environment)).toBe(true);
  });
});
