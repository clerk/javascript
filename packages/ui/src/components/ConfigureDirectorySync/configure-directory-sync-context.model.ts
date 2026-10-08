import type { ConfigureDirectorySyncModel } from './configure-directory-sync.types';
import { useDirectorySyncSourceModel } from './directory-sync-source.model';
import { DIRECTORY_SYNC_PROVIDERS, directorySyncProviderForConnection } from './providerMeta';

export const useConfigureDirectorySyncContextModel = (): ConfigureDirectorySyncModel => {
  const source = useDirectorySyncSourceModel();
  const provider =
    source.directory?.provider ??
    (source.connection ? directorySyncProviderForConnection(source.connection.provider) : undefined);
  return {
    requestKey: source.requestKey,
    directoryKey: source.directoryKey,
    canRun: source.canRun,
    canRunDirectory: source.canRunDirectory,
    isLoading: source.isLoading,
    connection: source.connection,
    enterpriseConnectionId: source.connection?.id ?? null,
    provider,
    providerMeta: provider ? DIRECTORY_SYNC_PROVIDERS[provider] : undefined,
    directory: source.directory,
    createDirectory: source.createDirectory,
    rotateToken: source.rotateToken,
    setDirectoryEnabled: source.setDirectoryEnabled,
    setCredentials: source.setCredentials,
    syncDirectory: source.syncDirectory,
  };
};
