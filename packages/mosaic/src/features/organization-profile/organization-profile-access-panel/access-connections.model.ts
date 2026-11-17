import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import {
  __internal_createCacheKeys as createCacheKeys,
  __internal_useClerkQuery as useClerkQuery,
  __internal_useOrganizationDirectorySync as useOrganizationDirectorySync,
  __internal_useOrganizationDomains as useOrganizationDomains,
  __internal_useOrganizationEnterpriseConnections as useOrganizationEnterpriseConnections,
  getClerkQueryClient,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type {
  DirectorySyncResource,
  EnterpriseConnectionResource,
  OrganizationEnterpriseConnectionProvider,
  OrganizationResource,
} from '@clerk/shared/types';

import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import type {
  AccessConnection,
  AccessData,
  AccessProvider,
  ConnectionConfiguration,
  ConnectionTestResult,
} from './access.types';
import { newConnection } from './access.utils';

const providers = {
  okta: 'saml_okta',
  entra: 'saml_microsoft',
  google: 'saml_google',
  saml: 'saml_custom',
  oidc: 'oidc_custom',
} satisfies Record<AccessProvider, OrganizationEnterpriseConnectionProvider>;

const providerNames: AccessProvider[] = ['okta', 'entra', 'google', 'saml', 'oidc'];

function unavailable() {
  return new ClerkRuntimeError('The connection is unavailable.', { code: 'access_connection_unavailable' });
}

function toSso(connection: EnterpriseConnectionResource, canManage: boolean): AccessConnection {
  const { samlConnection: saml, oauthConfig: oidc } = connection;
  const provider = providerNames.find(key => providers[key] === connection.provider);
  const isOidc = Boolean(oidc);
  return {
    id: connection.id,
    kind: 'sso',
    status: connection.active ? 'active' : 'inactive',
    canManage,
    signOnUrl: saml?.acsUrl,
    audience: saml?.spEntityId,
    redirectUri: oidc?.redirectUri,
    configuration: {
      ...newConnection(),
      name: connection.name,
      provider: provider ?? (isOidc ? 'oidc' : 'saml'),
      mode: saml?.idpMetadataUrl || oidc?.discoveryUrl ? 'metadata' : 'manual',
      domains: connection.domains,
      metadataUrl: saml?.idpMetadataUrl || oidc?.discoveryUrl || '',
      signOnUrl: saml?.idpSsoUrl || oidc?.authUrl || '',
      issuer: saml?.idpEntityId ?? '',
      certificate: saml?.idpCertificate ?? '',
      clientId: oidc?.clientId ?? '',
      tokenUrl: oidc?.tokenUrl ?? '',
      userInfoUrl: oidc?.userInfoUrl ?? '',
    },
  };
}

function toDirectory(directory: DirectorySyncResource): AccessConnection {
  return {
    id: directory.id,
    kind: 'directory',
    status: directory.enabled ? 'active' : 'inactive',
    endpointUrl: directory.endpointUrl,
    configuration: {
      ...newConnection(),
      name: directory.name,
      provider: directory.provider === 'custom' ? 'saml' : directory.provider,
      ssoConnectionId: directory.enterpriseConnectionId,
      directoryAttributeMapping: directory.attributeMapping,
      syncGroups: directory.groupRoleMappingEnabled,
      enabled: directory.enabled,
    },
  };
}

async function connectionParams(values: ConnectionConfiguration, previous?: EnterpriseConnectionResource) {
  const { name, provider, mode } = values;
  if (previous) {
    const original = toSso(previous, true).configuration;
    const settings = [
      'mode',
      'metadataUrl',
      'metadataFile',
      'signOnUrl',
      'issuer',
      'certificate',
      'clientId',
      'clientSecret',
      'tokenUrl',
      'userInfoUrl',
    ] as const;
    if (settings.every(key => values[key] === original[key])) {
      return { name };
    }
  }
  if (provider === 'oidc') {
    return {
      name,
      oidc: {
        clientId: values.clientId,
        clientSecret: values.clientSecret || undefined,
        ...(mode === 'metadata'
          ? { discoveryUrl: values.metadataUrl }
          : {
              discoveryUrl: null,
              authUrl: values.signOnUrl,
              tokenUrl: values.tokenUrl,
              userInfoUrl: values.userInfoUrl,
            }),
      },
    };
  }
  if (mode === 'file' && values.metadataFile) {
    return { name, saml: { idpMetadata: await values.metadataFile.text() } };
  }
  if (mode === 'metadata') {
    return { name, saml: { idpMetadataUrl: values.metadataUrl } };
  }
  const certificateChanged = values.certificate !== previous?.samlConnection?.idpCertificate;
  return {
    name,
    saml: {
      idpEntityId: values.issuer,
      idpSsoUrl: values.signOnUrl,
      idpCertificates: certificateChanged && values.certificate ? [values.certificate] : undefined,
    },
  };
}

async function readDirectory(organization: OrganizationResource, connectionId: string) {
  try {
    return await organization.getDirectorySync(connectionId);
  } catch (error) {
    if (isClerkAPIResponseError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function testSso(organization: OrganizationResource, id: string): Promise<ConnectionTestResult> {
  const { data } = await organization.getEnterpriseConnectionTestRuns(id, { pageSize: 1 });
  const run = data[0];
  if (!run || run.status === 'pending') {
    return { success: false, pending: true };
  }
  return {
    id: run.id,
    createdAt: run.createdAt?.getTime(),
    success: run.status === 'success',
    failureMessage: run.logs[0]?.message ?? run.logs[0]?.shortMessage,
    email: run.parsedUserInfo?.emailAddress,
    firstName: run.parsedUserInfo?.firstName,
    lastName: run.parsedUserInfo?.lastName,
  };
}

export function useAccessConnectionsModel(
  enabled: boolean,
  directoryParentId: string | null,
  onManageDirectory: (id: string | null) => void,
): Pick<
  AccessData,
  | 'connections'
  | 'canCreateSso'
  | 'canCreateDirectory'
  | 'eligibleSsoDomains'
  | 'onSaveConnection'
  | 'onConfigureDirectory'
  | 'onEnableSso'
  | 'onStartSsoTest'
  | 'onTestConnection'
  | 'onRotateDirectoryToken'
  | 'onManageDirectory'
  | 'directoryReadyToRotate'
  | 'connectionLoadError'
  | 'retryConnections'
  | 'isLoadingConnections'
> {
  const { organization } = useOrganization();
  const { session } = useSession();
  const { user } = useUser();
  const canManageSso = Boolean(
    organization?.selfServeSSOEnabled &&
    session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.enterpriseConnectionsManage }),
  );
  const canManageDirectories = Boolean(
    organization?.selfServeDirectorySyncEnabled &&
    session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.enterpriseConnectionsManage }),
  );
  const selectedDirectory = useOrganizationDirectorySync({
    enterpriseConnectionId: directoryParentId,
    enabled: enabled && canManageDirectories && typeof organization?.getDirectorySync === 'function',
  });
  const sso = useOrganizationEnterpriseConnections({
    enabled: enabled && typeof organization?.getEnterpriseConnections === 'function',
    keepPreviousData: false,
  });
  const domains = useOrganizationDomains({
    enabled: enabled && canManageSso && typeof organization?.getDomains === 'function',
    keepPreviousData: false,
    enrollmentMode: 'enterprise_sso',
  });
  const source = sso.data ?? [];
  const connectionIds = source.map(item => item.id).sort();
  const { queryKey } = createCacheKeys({
    stablePrefix: 'mosaic-access-directories',
    authenticated: true,
    tracked: { organizationId: organization?.id, userId: user?.id },
    untracked: { args: { connectionIds } },
  });
  const directories = useClerkQuery({
    queryKey,
    enabled:
      enabled &&
      canManageDirectories &&
      typeof organization?.getDirectorySync === 'function' &&
      connectionIds.length > 0,
    queryFn: async () => {
      if (!organization) {
        return [];
      }
      const found = await Promise.all(connectionIds.map(id => readDirectory(organization, id)));
      return found.filter(directory => directory !== null).map(toDirectory);
    },
  });
  const takenDomains = new Set(source.flatMap(item => item.domains));
  const eligibleSsoDomains =
    domains.data
      ?.filter(item => item.ownershipVerification?.status === 'verified' && !takenDomains.has(item.name))
      .map(item => item.name) ?? [];

  return {
    connections: [
      ...source.map(connection => toSso(connection, canManageSso)),
      ...(canManageDirectories ? (directories.data ?? []) : []),
    ],
    canCreateSso: canManageSso && typeof organization?.createEnterpriseConnection === 'function',
    canCreateDirectory:
      canManageDirectories &&
      typeof organization?.createDirectorySync === 'function' &&
      Boolean(directories.data) &&
      source.some(item => !directories.data?.some(directory => directory.configuration.ssoConnectionId === item.id)),
    eligibleSsoDomains,
    isLoadingConnections: sso.isLoading || directories.isLoading || domains.isLoading,
    connectionLoadError: Boolean(sso.error || directories.error || domains.error),
    ...connectionActions(organization, source, sso, queryKey, canManageSso, canManageDirectories),
    retryConnections: async () => {
      await Promise.allSettled([
        sso.revalidate(),
        domains.revalidate(),
        getClerkQueryClient()?.invalidateQueries({ queryKey }),
      ]);
    },
    onManageDirectory,
    onRotateDirectoryToken: canManageDirectories
      ? async id => {
          const directory = selectedDirectory.data;
          if (directory?.id !== id) {
            throw unavailable();
          }
          const rotated = await selectedDirectory.rotateDirectorySyncToken();
          if (!rotated?.apiKey) {
            throw unavailable();
          }
          return rotated.apiKey;
        }
      : undefined,
    directoryReadyToRotate: Boolean(selectedDirectory.data),
  };
}

function connectionActions(
  organization: OrganizationResource | null | undefined,
  source: EnterpriseConnectionResource[],
  sso: ReturnType<typeof useOrganizationEnterpriseConnections>,
  directoryKey: readonly unknown[],
  canManageSso: boolean,
  canManageDirectories: boolean,
) {
  const refreshDirectories = async () => {
    await getClerkQueryClient()?.invalidateQueries({ queryKey: directoryKey });
  };
  const getDirectory = async (id: string) => {
    const directory = organization && (await readDirectory(organization, id));
    if (!directory) {
      throw unavailable();
    }
    return directory;
  };
  const saveSso = async (values: ConnectionConfiguration, id?: string) => {
    const previous = source.find(connection => connection.id === id);
    const params = id ? await connectionParams(values, previous) : { name: values.name };
    const saved = id
      ? await sso.updateEnterpriseConnection(id, params)
      : await sso.createEnterpriseConnection({
          ...params,
          provider: providers[values.provider],
          domains: values.domains,
        });
    if (!saved) {
      throw unavailable();
    }
    return toSso(saved, true);
  };
  const configureDirectory = async (values: ConnectionConfiguration) => {
    if (!organization) {
      throw unavailable();
    }
    const id = values.ssoConnectionId;
    const current = await readDirectory(organization, id);
    const directory = current ?? (await organization.createDirectorySync(id, { name: values.name }));
    const token = directory.apiKey;
    const configured = values.serviceAccountFile
      ? await directory.setCredentials({
          serviceAccountJson: await values.serviceAccountFile.text(),
          subjectEmail: values.subjectEmail,
        })
      : directory;
    await refreshDirectories();
    return { ...toDirectory(configured), token: token ?? undefined };
  };
  return {
    onConfigureDirectory: canManageDirectories ? configureDirectory : undefined,
    onSaveConnection: async (kind: 'sso' | 'directory', values: ConnectionConfiguration, id?: string) => {
      if (kind === 'sso' && canManageSso) {
        return saveSso(values, id);
      }
      if (kind === 'directory' && canManageDirectories) {
        const directory = await getDirectory(values.ssoConnectionId);
        if (values.serviceAccountFile) {
          await directory.setCredentials({
            serviceAccountJson: await values.serviceAccountFile.text(),
            subjectEmail: values.subjectEmail,
          });
        }
        await updateDirectoryRoles(directory, values.groupRoles);
        const updated = await directory.update({
          enabled: values.enabled,
          attributeMapping: values.directoryAttributeMapping,
          groupRoleMappingEnabled: values.syncGroups,
        });
        await refreshDirectories();
        return toDirectory(updated);
      }
      throw unavailable();
    },
    onEnableSso: canManageSso
      ? async (id: string) => {
          const updated = await sso.updateEnterpriseConnection(id, { active: true });
          if (!updated) {
            throw unavailable();
          }
          return toSso(updated, true);
        }
      : undefined,
    onStartSsoTest:
      canManageSso && typeof organization?.createEnterpriseConnectionTestRun === 'function'
        ? async (id: string) => (await organization.createEnterpriseConnectionTestRun(id)).url
        : undefined,
    onTestConnection: async (kind: 'sso' | 'directory', values: ConnectionConfiguration, id?: string) => {
      if (kind === 'sso' && id && organization && canManageSso) {
        return testSso(organization, id);
      }
      if (kind === 'directory' && canManageDirectories) {
        const directory = await getDirectory(values.ssoConnectionId);
        return testDirectory(directory);
      }
      throw unavailable();
    },
  };
}

async function updateDirectoryRoles(directory: DirectorySyncResource, edits: Record<string, string>) {
  if (!Object.keys(edits).length) {
    return;
  }

  const { data } = await directory.getGroupRoleMappings();
  const roles = new Map<string, string>();
  for (const mapping of data) {
    if (mapping.role) {
      roles.set(mapping.directoryGroupId, mapping.role.key);
    }
  }
  for (const [id, role] of Object.entries(edits)) {
    if (role === 'none') {
      roles.delete(id);
    } else {
      roles.set(id, role.startsWith('org:') ? role : `org:${role}`);
    }
  }
  await directory.replaceGroupRoleMappings({
    mappings: Array.from(roles, ([directoryGroupId, role]) => ({ directoryGroupId, role })),
  });
}

async function testDirectory(directory: DirectorySyncResource): Promise<ConnectionTestResult> {
  if (directory.provider === 'google') {
    const status = await directory.getSyncStatus();
    if (status.lastSyncStatus === 'running') {
      return { success: false, pending: true };
    }
    if (status.lastSyncStatus === 'failed' || status.lastSyncStatus === 'cancelled') {
      return { success: false };
    }
    if (!status.lastSyncedAt) {
      await directory.sync();
      return { success: false, pending: true };
    }
  }
  const [users, groups, roleMappings] = await Promise.all([
    directory.getUsers({ pageSize: 1 }),
    directory.getGroups({ limit: 100 }),
    directory.getGroupRoleMappings(),
  ]);
  const user = users.data[0];
  return user
    ? {
        success: true,
        email: user.identifier ?? undefined,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        groups: groups.data.map(group => group.id),
        groupNames: Object.fromEntries(groups.data.map(group => [group.id, group.displayName])),
        groupRoles: Object.fromEntries(
          roleMappings.data.flatMap(mapping =>
            mapping.role ? [[mapping.directoryGroupId, mapping.role.key.replace(/^org:/, '')]] : [],
          ),
        ),
      }
    : { success: false, pending: true };
}
