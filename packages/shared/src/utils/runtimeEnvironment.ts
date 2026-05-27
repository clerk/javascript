import { getEnvVariable } from '../getEnvVariable';

export const automatedEnvironmentVariables = [
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
  'NOW_BUILDER',
  'CF_PAGES',
] as const;

const isTruthyEnvValue = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value) {
    return false;
  }

  return !['0', 'false', 'off', 'no'].includes(value.toLowerCase());
};

export const isDevelopmentEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'development';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite

  return false;
};

export const isTestEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'test';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};

export const isProductionEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'production';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};

export const isAutomatedEnvironment = (): boolean => {
  return automatedEnvironmentVariables.some(name => isTruthyEnvValue(getEnvVariable(name)));
};
