import type { DirectorySyncProvider, SetDirectorySyncCredentialsParams } from '@clerk/shared/types';

import type { DirectorySyncProviderMeta } from './providerMeta';

export type DirectorySyncConnection = {
  name: string;
  active: boolean;
  domains: string[];
};

export type DirectorySyncDirectory = {
  id: string;
  endpointUrl: string;
  attributeMapping: Record<string, string>;
  credentialsConfigured: boolean | null;
};

export type DirectorySyncToken = {
  directoryId: string;
  enterpriseConnectionId: string;
  token: string;
};

export type ConfigureDirectorySyncModel = Omit<
  ConfigureDirectorySyncData,
  'revealedToken' | 'onExit' | 'createDirectory' | 'rotateToken'
> & {
  createDirectory: () => Promise<DirectorySyncToken | null>;
  rotateToken: () => Promise<DirectorySyncToken | null>;
};

/**
 * Shared state for the ConfigureDirectorySync wizard, persisted across steps.
 *
 * The directory hangs 1:1 off the organization's (single) enterprise
 * connection. `revealedToken` carries the show-once SCIM bearer token from the
 * create/rotate response for the lifetime of this provider only — it is never
 * fetchable again.
 */
export interface ConfigureDirectorySyncData {
  requestKey: string;
  directoryKey: string;
  canRun: () => boolean;
  canRunDirectory: () => boolean;
  isLoading: boolean;
  enterpriseConnectionId: string | null;
  connection: DirectorySyncConnection | undefined;
  /** SCIM provider derived from the connection's IdP; `undefined` without a connection. */
  provider: DirectorySyncProvider | undefined;
  providerMeta: DirectorySyncProviderMeta | undefined;
  /** The directory, `null` when none has been created yet, `undefined` while loading. */
  directory: DirectorySyncDirectory | null | undefined;
  /** The show-once bearer token, if it was revealed during this wizard session. */
  revealedToken: string | null;
  createDirectory: () => Promise<void>;
  rotateToken: () => Promise<void>;
  setDirectoryEnabled: (enabled: boolean) => Promise<void>;
  /** Stores the credential a pull directory reads the identity provider with. */
  setCredentials: (params: SetDirectorySyncCredentialsParams) => Promise<void>;
  /** Starts a sync for a pull directory. */
  syncDirectory: () => Promise<void>;
  onExit?: () => void;
}
