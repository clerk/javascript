import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const automatedEnvironmentVariables = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'BUILDKITE',
  'BITBUCKET_BUILD_NUMBER',
  'APPVEYOR',
  'CODEBUILD_BUILD_ID',
  'TF_BUILD',
  'TEAMCITY_VERSION',
  'JENKINS_URL',
  'HUDSON_URL',
  'BAMBOO_BUILDKEY',
  'VERCEL',
  'NETLIFY',
  'CF_PAGES',
  'CODESPACES',
  'GITPOD_WORKSPACE_ID',
] as const;

async function loadCanUseKeyless() {
  vi.resetModules();
  const { canUseKeyless } = await import('../feature-flags.js');
  return canUseKeyless;
}

describe('canUseKeyless', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NUXT_PUBLIC_CLERK_KEYLESS_DISABLED', undefined);
    vi.stubEnv('CLERK_KEYLESS_DISABLED', undefined);
    automatedEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('enables keyless in development when automation signals are absent', async () => {
    await expect(loadCanUseKeyless()).resolves.toBe(true);
  });

  it('disables keyless in CI even when the app runs in development mode', async () => {
    vi.stubEnv('CI', 'true');

    await expect(loadCanUseKeyless()).resolves.toBe(false);
  });
});
