import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAutomatedEnvironment } from '../utils/runtimeEnvironment';

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

describe('isAutomatedEnvironment', () => {
  beforeEach(() => {
    automatedEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true when a CI environment variable is enabled', () => {
    vi.stubEnv('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });

  it('returns false when automation environment variables are explicitly falsey', () => {
    const falseyValues = ['false', '0', 'off', 'no'];

    automatedEnvironmentVariables.forEach((name, index) => {
      vi.stubEnv(name, falseyValues[index % falseyValues.length]);
    });

    expect(isAutomatedEnvironment()).toBe(false);
  });

  it('detects automation environment variables from shared runtime fallbacks', () => {
    vi.stubEnv('CI', undefined);
    vi.stubGlobal('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });

  it('ignores non-string automation environment variables from shared runtime fallbacks', () => {
    vi.stubEnv('CI', undefined);
    vi.stubGlobal('CI', true);

    expect(isAutomatedEnvironment()).toBe(false);
  });
});
