import { randomBytes } from 'node:crypto';

import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';

import { getE2EApplicationRunMarker } from '../testUtils/e2eRun';

const PLATFORM_API_URL = 'https://api.clerk.com';

export type InstanceKeys = { pk: string; sk: string };
export type PlatformApplication = InstanceKeys & { applicationId: string; instanceId: string };
export type PlatformApplicationListItem = {
  application_id: string;
  name: string;
  instances: Array<{ environment_type?: string; instance_id?: string }>;
};
export type PlatformApplicationSetupContext = {
  applicationId: string;
  applicationName: string;
  clerkClient: ClerkClient;
  instanceId: string;
  publishableKey: string;
  patchConfig: (config: unknown) => Promise<void>;
};
export type PlatformApplicationConfig = {
  config: unknown;
  setup?: (context: PlatformApplicationSetupContext) => Promise<void> | void;
};

export const defineConfig = (config: PlatformApplicationConfig): PlatformApplicationConfig => config;

const platformApiRequest = async (platformApiKey: string, url: URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${platformApiKey}`);
  headers.set('Accept', 'application/json');
  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    throw new Error(`${init?.method || 'GET'} ${url} failed (${response.status}): ${await response.text()}`);
  }

  return response;
};

export const listApplications = async (platformApiKey: string): Promise<PlatformApplicationListItem[]> => {
  const response = await platformApiRequest(platformApiKey, new URL('/v1/platform/applications', PLATFORM_API_URL));
  return (await response.json()) as PlatformApplicationListItem[];
};

export const deleteApplication = async (platformApiKey: string, applicationId: string): Promise<void> => {
  await platformApiRequest(
    platformApiKey,
    new URL(`/v1/platform/applications/${encodeURIComponent(applicationId)}`, PLATFORM_API_URL),
    { method: 'DELETE' },
  );
};

export const createApplicationFromConfig = async (
  platformApiKey: string,
  keyName: string,
  definition: PlatformApplicationConfig,
  runKey?: string,
): Promise<PlatformApplication> => {
  const { config, setup } = definition;
  const applicationRunMarker =
    getE2EApplicationRunMarker(runKey) ||
    `random-${Array.from(randomBytes(10), byte => String.fromCharCode(97 + (byte % 26))).join('')}`;
  const applicationName = `e2e-${keyName}-${applicationRunMarker}`;
  const createUrl = new URL('/v1/platform/applications', PLATFORM_API_URL);
  const createResponse = await platformApiRequest(platformApiKey, createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: applicationName, from_source: 'cli' }),
  });
  const created = (await createResponse.json()) as { application_id?: string };

  if (!created.application_id) {
    throw new Error('The create response does not contain an application ID.');
  }

  const applicationPath = `/v1/platform/applications/${encodeURIComponent(created.application_id)}`;
  const applicationUrl = new URL(`${applicationPath}?include_secret_keys=true`, PLATFORM_API_URL);
  const applicationResponse = await platformApiRequest(platformApiKey, applicationUrl);
  const application = (await applicationResponse.json()) as {
    instances?: Array<{
      environment_type?: string;
      instance_id?: string;
      publishable_key?: string;
      secret_key?: string;
    }>;
  };
  const developmentInstance = application.instances?.find(instance => instance.environment_type === 'development');

  if (!developmentInstance?.instance_id) {
    throw new Error(`Application ${created.application_id} does not have a development instance.`);
  }
  if (!developmentInstance.publishable_key || !developmentInstance.secret_key) {
    throw new Error(`Development instance ${developmentInstance.instance_id} does not contain both API keys.`);
  }

  const configUrl = new URL(
    `${applicationPath}/instances/${encodeURIComponent(developmentInstance.instance_id)}/config`,
    PLATFORM_API_URL,
  );
  const patchConfig = async (config: unknown) => {
    await platformApiRequest(platformApiKey, configUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  };
  await patchConfig(config);

  const organizationSettings = (config as { organization_settings?: { force_organization_selection?: boolean } })
    .organization_settings;
  if (organizationSettings?.force_organization_selection === false) {
    await patchConfig({ organization_settings: { force_organization_selection: false } });
  }

  if (setup) {
    await setup({
      applicationId: created.application_id,
      applicationName,
      clerkClient: createClerkClient({ secretKey: developmentInstance.secret_key }),
      instanceId: developmentInstance.instance_id,
      publishableKey: developmentInstance.publishable_key,
      patchConfig,
    });
  }

  return {
    applicationId: created.application_id,
    instanceId: developmentInstance.instance_id,
    pk: developmentInstance.publishable_key,
    sk: developmentInstance.secret_key,
  };
};
