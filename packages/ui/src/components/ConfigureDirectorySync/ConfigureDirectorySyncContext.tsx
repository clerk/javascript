import {
  __internal_useOrganizationDirectorySync,
  __internal_useOrganizationDirectorySyncGroupRoleMappings,
  __internal_useOrganizationEnterpriseConnections,
} from '@clerk/shared/react';
import type {
  DirectorySyncProvider,
  DirectorySyncResource,
  EnterpriseConnectionResource,
  SetDirectorySyncCredentialsParams,
  UpdateDirectorySyncParams,
} from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import { useFetchRoles } from '../../hooks/useFetchRoles';
import { sortEnterpriseConnections } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import type { DirectorySyncProviderMeta } from './providerMeta';
import { DIRECTORY_SYNC_PROVIDERS, directorySyncProviderForConnection } from './providerMeta';
import type { GroupRoleMapping, RoleOption, UnmappedGroup } from './roleMapping';
import { moveItem, NO_ROLE_KEY } from './roleMapping';

/**
 * Group → role mapping edits for the wizard's role mapping step. Edits stay
 * local until `save`; `mappings` is ordered by priority (index 0 wins).
 */
export interface RoleMappingView {
  isLoading: boolean;
  error: Error | null;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  roles: RoleOption[];
  mappings: GroupRoleMapping[];
  unmappedGroups: UnmappedGroup[];
  /** Binds a group to a role; a new mapping is appended at the lowest priority. `NO_ROLE_KEY` unmaps it. */
  setRole: (group: UnmappedGroup, roleKey: string) => void;
  /** Reorders a mapping by position within `mappings`. */
  move: (from: number, to: number) => void;
  /** The role members in no mapped group receive. */
  defaultRole: RoleOption | null;
  /** Writes any changed mappings and the enabled flag. */
  save: () => Promise<void>;
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
  /** Stores the credential a pull directory reads the identity provider with. */
  setCredentials: (params: SetDirectorySyncCredentialsParams) => Promise<DirectorySyncResource | undefined>;
  /** Starts a sync for a pull directory. */
  syncDirectory: () => Promise<void>;
  roleMapping: RoleMappingView;
  contentRef?: React.RefObject<HTMLDivElement>;
  onExit?: () => void;
}

const ConfigureDirectorySyncContext = React.createContext<ConfigureDirectorySyncData | null>(null);
ConfigureDirectorySyncContext.displayName = 'ConfigureDirectorySyncContext';

type ConfigureDirectorySyncProviderProps = PropsWithChildren<{
  contentRef?: React.RefObject<HTMLDivElement>;
  onExit?: () => void;
}>;

type RevealedToken = {
  enterpriseConnectionId: string;
  token: string;
};

export const ConfigureDirectorySyncProvider = ({
  contentRef,
  onExit,
  children,
}: ConfigureDirectorySyncProviderProps): JSX.Element => {
  const { data: connections, isLoading: isLoadingConnections } = __internal_useOrganizationEnterpriseConnections();
  // Per-connection Directory Sync is not modelled yet, so the directory hangs
  // off the organization's first connection in deterministic order.
  const connection = sortEnterpriseConnections(connections ?? [])[0];
  const enterpriseConnectionId = connection?.id ?? null;

  const {
    data: directory,
    isLoading: isLoadingDirectory,
    createDirectorySync,
    updateDirectorySync,
    rotateDirectorySyncToken,
    setDirectorySyncCredentials,
    syncDirectory,
  } = __internal_useOrganizationDirectorySync({ enterpriseConnectionId });

  // The token is stored with the connection it was issued for, so a response
  // that lands after the connection changed is never shown for the new one.
  const [revealed, setRevealed] = React.useState<RevealedToken | null>(null);
  const revealedToken = revealed && revealed.enterpriseConnectionId === enterpriseConnectionId ? revealed.token : null;

  const revealFrom = (result: DirectorySyncResource | undefined): void => {
    if (result?.apiKey) {
      setRevealed({ enterpriseConnectionId: result.enterpriseConnectionId, token: result.apiKey });
    }
  };

  const createDirectory = React.useCallback(async () => {
    const created = await createDirectorySync();
    revealFrom(created);
    return created;
  }, [createDirectorySync]);

  const rotateToken = React.useCallback(async () => {
    const rotated = await rotateDirectorySyncToken();
    revealFrom(rotated);
    return rotated;
  }, [rotateDirectorySyncToken]);

  const setDirectoryEnabled = React.useCallback(
    (enabled: boolean) => updateDirectorySync({ enabled }),
    [updateDirectorySync],
  );

  const provider =
    directory?.provider ?? (connection ? directorySyncProviderForConnection(connection.provider) : undefined);

  const roleMapping = useRoleMapping(directory, updateDirectorySync);

  const value: ConfigureDirectorySyncData = {
    isLoading: isLoadingConnections || (Boolean(enterpriseConnectionId) && isLoadingDirectory),
    connection,
    provider,
    providerMeta: provider ? DIRECTORY_SYNC_PROVIDERS[provider] : undefined,
    directory,
    revealedToken,
    createDirectory,
    rotateToken,
    setDirectoryEnabled,
    setCredentials: setDirectorySyncCredentials,
    syncDirectory,
    roleMapping,
    contentRef,
    onExit,
  };

  return <ConfigureDirectorySyncContext.Provider value={value}>{children}</ConfigureDirectorySyncContext.Provider>;
};

const sameMappings = (a: GroupRoleMapping[], b: GroupRoleMapping[]): boolean =>
  a.length === b.length && a.every((m, i) => m.groupId === b[i].groupId && m.roleKey === b[i].roleKey);

const useRoleMapping = (
  directory: DirectorySyncResource | null | undefined,
  updateDirectorySync: (params: UpdateDirectorySyncParams) => Promise<DirectorySyncResource | undefined>,
): RoleMappingView => {
  const {
    data,
    error,
    isLoading: isLoadingMappings,
    replaceGroupRoleMappings,
  } = __internal_useOrganizationDirectorySyncGroupRoleMappings({ directory });
  const { options: roleOptions, isLoading: isLoadingRoles } = useFetchRoles();

  const savedMappings = React.useMemo<GroupRoleMapping[]>(
    () =>
      (data?.mappings ?? []).flatMap(m =>
        m.role ? [{ groupId: m.directoryGroupId, groupName: m.directoryGroupDisplayName, roleKey: m.role.key }] : [],
      ),
    [data?.mappings],
  );
  const savedEnabled = directory?.groupRoleMappingEnabled ?? false;

  const [draftMappings, setDraftMappings] = React.useState<GroupRoleMapping[] | null>(null);
  const [draftEnabled, setDraftEnabled] = React.useState<boolean | null>(null);
  const mappings = draftMappings ?? savedMappings;
  const enabled = draftEnabled ?? savedEnabled;

  const unmappedGroups = React.useMemo<UnmappedGroup[]>(
    () =>
      (data?.groups ?? [])
        .filter(g => !mappings.some(m => m.groupId === g.id))
        .map(g => ({ id: g.id, name: g.displayName }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data?.groups, mappings],
  );

  const setRole = React.useCallback(
    (group: UnmappedGroup, roleKey: string) => {
      setDraftMappings(prev => {
        const current = prev ?? savedMappings;
        if (roleKey === NO_ROLE_KEY) {
          return current.filter(m => m.groupId !== group.id);
        }
        return current.some(m => m.groupId === group.id)
          ? current.map(m => (m.groupId === group.id ? { ...m, roleKey } : m))
          : [...current, { groupId: group.id, groupName: group.name, roleKey }];
      });
    },
    [savedMappings],
  );

  const move = React.useCallback(
    (from: number, to: number) => {
      setDraftMappings(prev => moveItem(prev ?? savedMappings, from, to));
    },
    [savedMappings],
  );

  const save = React.useCallback(async () => {
    if (draftMappings && !sameMappings(draftMappings, savedMappings)) {
      await replaceGroupRoleMappings({
        mappings: draftMappings.map(m => ({ directoryGroupId: m.groupId, role: m.roleKey })),
      });
    }
    setDraftMappings(null);
    if (draftEnabled !== null && draftEnabled !== savedEnabled) {
      await updateDirectorySync({ groupRoleMappingEnabled: draftEnabled });
    }
    setDraftEnabled(null);
  }, [draftMappings, savedMappings, draftEnabled, savedEnabled, replaceGroupRoleMappings, updateDirectorySync]);

  const defaultRole = data?.defaultRole
    ? {
        value: data.defaultRole.key,
        label: roleOptions?.find(r => r.value === data.defaultRole?.key)?.label ?? data.defaultRole.name,
      }
    : null;

  return {
    isLoading: isLoadingMappings || Boolean(isLoadingRoles),
    error,
    enabled,
    setEnabled: setDraftEnabled,
    roles: roleOptions ?? [],
    mappings,
    unmappedGroups,
    setRole,
    move,
    defaultRole,
    save,
  };
};

export const useConfigureDirectorySync = (): ConfigureDirectorySyncData => {
  const ctx = React.useContext(ConfigureDirectorySyncContext);
  if (!ctx) {
    throw new Error('useConfigureDirectorySync called outside <ConfigureDirectorySyncProvider>.');
  }
  return ctx;
};
