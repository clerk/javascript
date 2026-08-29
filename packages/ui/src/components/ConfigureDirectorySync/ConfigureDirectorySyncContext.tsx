import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationDirectorySyncUsers,
  __internal_useOrganizationEnterpriseConnections,
} from '@clerk/shared/react';
import type {
  DirectorySyncProvider,
  DirectorySyncResource,
  DirectorySyncUserResource,
  EnterpriseConnectionResource,
} from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import type { DirectorySyncProviderMeta } from './providerMeta';
import { DIRECTORY_SYNC_PROVIDERS, directorySyncProviderForConnection } from './providerMeta';

export interface DirectorySyncUsersView {
  data: DirectorySyncUserResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  revalidate: () => Promise<void>;
}

/**
 * Shared state for the ConfigureDirectorySync wizard, persisted across steps.
 *
 * The directory hangs 1:1 off the organization's (single) enterprise
 * connection. `revealedToken` carries the show-once SCIM bearer token from the
 * create/rotate response for the lifetime of this provider only — it is never
 * fetchable again.
 */
export interface ConfigureDirectorySyncData {
  isLoading: boolean;
  connection: EnterpriseConnectionResource | undefined;
  /** SCIM provider derived from the connection's IdP; `undefined` without a connection. */
  provider: DirectorySyncProvider | undefined;
  providerMeta: DirectorySyncProviderMeta | undefined;
  /** The directory, `null` when none has been created yet, `undefined` while loading. */
  directory: DirectorySyncResource | null | undefined;
  /** The show-once bearer token, if it was revealed during this wizard session. */
  revealedToken: string | null;
  createDirectory: () => Promise<DirectorySyncResource | undefined>;
  rotateToken: () => Promise<DirectorySyncResource | undefined>;
  setDirectoryEnabled: (enabled: boolean) => Promise<DirectorySyncResource | undefined>;
  users: DirectorySyncUsersView;
  onExit?: () => void;
}

const ConfigureDirectorySyncContext = React.createContext<ConfigureDirectorySyncData | null>(null);
ConfigureDirectorySyncContext.displayName = 'ConfigureDirectorySyncContext';

type ConfigureDirectorySyncProviderProps = PropsWithChildren<{
  onExit?: () => void;
}>;

export const ConfigureDirectorySyncProvider = ({
  onExit,
  children,
}: ConfigureDirectorySyncProviderProps): JSX.Element => {
  const { data: connections, isLoading: isLoadingConnections } = __internal_useOrganizationEnterpriseConnections();
  // The self-serve SSO flow enforces a single connection per organization; the
  // directory hangs off that same connection.
  const connection = connections?.[0];
  const enterpriseConnectionId = connection?.id ?? null;

  const {
    data: directory,
    isLoading: isLoadingDirectory,
    createDirectorySync,
    updateDirectorySync,
    rotateDirectorySyncToken,
  } = __internal_useOrganizationDirectorySync({ enterpriseConnectionId });

  const usersHook = __internal_useOrganizationDirectorySyncUsers({ directory });

  const [revealedToken, setRevealedToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // The token belongs to the current connection's directory; drop it if the
    // connection changes mid-session.
    setRevealedToken(null);
  }, [enterpriseConnectionId]);

  const createDirectory = React.useCallback(async () => {
    const created = await createDirectorySync();
    if (created?.apiKey) {
      setRevealedToken(created.apiKey);
    }
    return created;
  }, [createDirectorySync]);

  const rotateToken = React.useCallback(async () => {
    const rotated = await rotateDirectorySyncToken();
    if (rotated?.apiKey) {
      setRevealedToken(rotated.apiKey);
    }
    return rotated;
  }, [rotateDirectorySyncToken]);

  const setDirectoryEnabled = React.useCallback(
    (enabled: boolean) => updateDirectorySync({ enabled }),
    [updateDirectorySync],
  );

  const provider =
    directory?.provider ?? (connection ? directorySyncProviderForConnection(connection.provider) : undefined);

  const users = React.useMemo<DirectorySyncUsersView>(
    () => ({
      data: usersHook.data,
      totalCount: usersHook.totalCount,
      error: usersHook.error,
      isLoading: usersHook.isLoading,
      isPolling: usersHook.isPolling,
      startPolling: usersHook.startPolling,
      stopPolling: usersHook.stopPolling,
      revalidate: usersHook.revalidate,
    }),
    [
      usersHook.data,
      usersHook.totalCount,
      usersHook.error,
      usersHook.isLoading,
      usersHook.isPolling,
      usersHook.startPolling,
      usersHook.stopPolling,
      usersHook.revalidate,
    ],
  );

  const value = React.useMemo<ConfigureDirectorySyncData>(
    () => ({
      isLoading: isLoadingConnections || (Boolean(enterpriseConnectionId) && isLoadingDirectory),
      connection,
      provider,
      providerMeta: provider ? DIRECTORY_SYNC_PROVIDERS[provider] : undefined,
      directory,
      revealedToken,
      createDirectory,
      rotateToken,
      setDirectoryEnabled,
      users,
      onExit,
    }),
    [
      isLoadingConnections,
      isLoadingDirectory,
      enterpriseConnectionId,
      connection,
      provider,
      directory,
      revealedToken,
      createDirectory,
      rotateToken,
      setDirectoryEnabled,
      users,
      onExit,
    ],
  );

  return <ConfigureDirectorySyncContext.Provider value={value}>{children}</ConfigureDirectorySyncContext.Provider>;
};

export const useConfigureDirectorySync = (): ConfigureDirectorySyncData => {
  const ctx = React.useContext(ConfigureDirectorySyncContext);
  if (!ctx) {
    throw new Error('useConfigureDirectorySync called outside <ConfigureDirectorySyncProvider>.');
  }
  return ctx;
};
