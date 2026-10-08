import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationEnterpriseConnections,
  useClerk,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { DirectorySyncResource, SetDirectorySyncCredentialsParams } from '@clerk/shared/types';
import { useCallback, useEffect, useRef } from 'react';

import { sortEnterpriseConnections } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import type { DirectorySyncToken } from './configure-directory-sync.types';

export const useDirectorySyncSourceModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = __internal_useOrganizationEnterpriseConnections({ keepPreviousData: false });
  const connection = sortEnterpriseConnections(connections ?? [])[0];
  const connectionId = connection?.id ?? null;
  const {
    data: directoryData,
    isLoading: isLoadingDirectory,
    error: directoryError,
    createDirectorySync,
    updateDirectorySync,
    deleteDirectorySync,
    rotateDirectorySyncToken,
    setDirectorySyncCredentials,
    syncDirectory,
  } = __internal_useOrganizationDirectorySync({ enterpriseConnectionId: connectionId });
  const directory =
    directoryData &&
    (directoryData.organizationId !== organizationId || directoryData.enterpriseConnectionId !== connectionId)
      ? undefined
      : directoryData;
  const identity = JSON.stringify([actor, sessionId, clientId, organizationId, connectionId]);
  const scope = useRef({ identity, version: 0 });
  if (scope.current.identity !== identity) {
    scope.current = { identity, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const canRun = useCallback(
    () =>
      mounted.current &&
      scope.current.version === version &&
      Boolean(actor && organizationId) &&
      clerk.user?.id === actor &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      clerk.organization?.id === organizationId,
    [clerk, actor, sessionId, clientId, organizationId, version],
  );
  const directoryIdentity = JSON.stringify([identity, version, directory?.id]);
  const directoryScope = useRef({ identity: directoryIdentity, version: 0 });
  if (directoryScope.current.identity !== directoryIdentity) {
    directoryScope.current = { identity: directoryIdentity, version: directoryScope.current.version + 1 };
  }
  const directoryVersion = directoryScope.current.version;
  const canRunDirectory = useCallback(
    () => canRun() && directoryScope.current.version === directoryVersion,
    [canRun, directoryVersion],
  );
  const hasDirectory = Boolean(directory);
  const runOwnedRequest = useCallback(
    async <T>(request: () => Promise<T>, isCurrent: () => boolean): Promise<T | undefined> => {
      if (!isCurrent()) {
        return;
      }
      try {
        const result = await request();
        return isCurrent() ? result : undefined;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      }
    },
    [],
  );
  const toToken = useCallback(
    (resource: DirectorySyncResource | undefined): DirectorySyncToken | null =>
      resource?.apiKey && resource.organizationId === organizationId && resource.enterpriseConnectionId === connectionId
        ? { directoryId: resource.id, enterpriseConnectionId: resource.enterpriseConnectionId, token: resource.apiKey }
        : null,
    [organizationId, connectionId],
  );
  const createDirectory = useCallback(async () => {
    if (!connectionId) {
      return null;
    }
    return toToken(await runOwnedRequest(createDirectorySync, canRun));
  }, [connectionId, createDirectorySync, canRun, runOwnedRequest, toToken]);
  const rotateToken = useCallback(async () => {
    if (!hasDirectory) {
      return null;
    }
    return toToken(await runOwnedRequest(rotateDirectorySyncToken, canRunDirectory));
  }, [hasDirectory, rotateDirectorySyncToken, canRunDirectory, runOwnedRequest, toToken]);
  const setDirectoryEnabled = useCallback(
    async (enabled: boolean) => {
      if (hasDirectory) {
        await runOwnedRequest(() => updateDirectorySync({ enabled }), canRunDirectory);
      }
    },
    [hasDirectory, updateDirectorySync, canRunDirectory, runOwnedRequest],
  );
  const deleteDirectory = useCallback(async () => {
    if (hasDirectory) {
      await runOwnedRequest(deleteDirectorySync, canRunDirectory);
    }
  }, [hasDirectory, deleteDirectorySync, canRunDirectory, runOwnedRequest]);
  const setCredentials = useCallback(
    async (params: SetDirectorySyncCredentialsParams) => {
      if (hasDirectory) {
        await runOwnedRequest(() => setDirectorySyncCredentials(params), canRunDirectory);
      }
    },
    [hasDirectory, setDirectorySyncCredentials, canRunDirectory, runOwnedRequest],
  );
  const sync = useCallback(async () => {
    if (hasDirectory) {
      await runOwnedRequest(syncDirectory, canRunDirectory);
    }
  }, [hasDirectory, syncDirectory, canRunDirectory, runOwnedRequest]);
  const error = connectionsError ?? directoryError;
  return {
    requestKey: JSON.stringify([identity, version]),
    directoryKey: JSON.stringify([directoryIdentity, directoryVersion]),
    canRun,
    canRunDirectory,
    isLoading: isLoadingConnections || (Boolean(connectionId) && isLoadingDirectory),
    errorMessage: error?.message,
    hasError: Boolean(error),
    connection: connection
      ? {
          id: connection.id,
          name: connection.name,
          active: connection.active,
          domains: [...(connection.domains ?? [])],
          provider: connection.provider,
        }
      : undefined,
    directory: directory
      ? {
          id: directory.id,
          enabled: directory.enabled,
          provider: directory.provider,
          endpointUrl: directory.endpointUrl,
          attributeMapping: { ...directory.attributeMapping },
          credentialsConfigured: directory.credentialsConfigured,
        }
      : directory,
    createDirectory,
    rotateToken,
    setDirectoryEnabled,
    deleteDirectory,
    setCredentials,
    syncDirectory: sync,
  };
};
