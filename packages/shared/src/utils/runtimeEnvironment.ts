import { parsePublishableKey } from './keys';

/**
 * Check for development runtime environment using the environment variables of the Clerk publishableKey.
 *
 * Examples:
 *
 * 1. using process.env: `isDevelopmentEnvironment()`
 * 2. passing custom process.env source: `isDevelopmentEnvironment(import.meta.env)`
 * 3. using publishableKey: `isDevelopmentEnvironment('pk_********')`
 *
 * @param envOrPublishableKey
 * @returns boolean
 */
export const isDevelopmentEnvironment = (envOrPublishableKey?: EnvironmentOrPublishableKey): boolean => {
  return isEnvironment('development', envOrPublishableKey);
};

/**
 * Check for testing runtime environment using the environment variables of the Clerk publishableKey.
 *
 * Examples:
 *
 * 1. using process.env: `isTestEnvironment()`
 * 2. passing custom process.env source: `isTestEnvironment(import.meta.env)`
 * 3. using publishableKey: `isTestEnvironment('pk_test_********')`
 *
 * The `isTestEnvironment()` will always be false for any publishableKey since development and production
 * publishable keys are only supported.
 *
 * @param envOrPublishableKey
 * @returns boolean
 */
export const isTestEnvironment = (envOrPublishableKey?: EnvironmentOrPublishableKey): boolean => {
  return isEnvironment('test', envOrPublishableKey);
};

/**
 * Check for production runtime environment using the environment variables of the Clerk publishableKey.
 *
 * Examples:
 *
 * 1. using process.env: `isProductionEnvironment()`
 * 2. passing custom process.env source: `isProductionEnvironment(import.meta.env)`
 * 3. using publishableKey: `isProductionEnvironment('pk_live_********')`
 *
 * @param envOrPublishableKey
 * @returns boolean
 */
export const isProductionEnvironment = (envOrPublishableKey?: EnvironmentOrPublishableKey): boolean => {
  return isEnvironment('production', envOrPublishableKey);
};

const getRuntimeFromProcess = (env?: typeof process.env) => {
  return env?.NODE_ENV;
};

const getRuntimeFromPublishableKey = (publishableKey: string) => {
  return parsePublishableKey(publishableKey)?.instanceType;
};

const isPublishableKey = (envOrPublishableKey?: string | typeof process.env): envOrPublishableKey is string => {
  return typeof envOrPublishableKey === 'string';
};

type Environment = 'development' | 'production' | 'test';
type EnvironmentOrPublishableKey = typeof process.env | string;

// Allow passing env as arg to support Cloudflare workers case
function isEnvironment(environment: Environment, envOrPublishableKey?: EnvironmentOrPublishableKey) {
  try {
    envOrPublishableKey ||= process?.env;
    // eslint-disable-next-line no-empty
  } catch (err) {}

  if (isPublishableKey(envOrPublishableKey)) {
    return getRuntimeFromPublishableKey(envOrPublishableKey) === environment;
  }

  // TODO: add support for import.meta.env.DEV that is being used by vite

  return getRuntimeFromProcess(envOrPublishableKey) === environment;
}
