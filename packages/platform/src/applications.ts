/**
 * @clerk/platform/applications
 *
 * Tree-shakable sub-module for the Applications API
 *
 * @example
 * ```ts
 * import { PlatformHttpClient } from '@clerk/platform';
 * import { createApplicationsAPI } from '@clerk/platform/applications';
 *
 * const client = new PlatformHttpClient({ accessToken: 'your_token' });
 * const applications = createApplicationsAPI(client);
 *
 * const apps = await applications.list();
 * ```
 *
 * @packageDocumentation
 */

export { PlatformHttpClient } from './client';
export { ApplicationsAPI, createApplicationsAPI } from './resources/applications';
export type {
  ApplicationInstance,
  ApplicationResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  DeletedObjectResponse,
  EnvironmentType,
  PlatformClientOptions,
  RequestOptions,
} from './types';
