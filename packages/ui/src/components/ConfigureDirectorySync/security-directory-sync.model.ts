import { useDirectorySyncSourceModel } from './directory-sync-source.model';

export const useSecurityDirectorySyncModel = () => {
  const source = useDirectorySyncSourceModel();
  return {
    requestKey: source.directoryKey,
    canRun: source.canRunDirectory,
    isLoading: source.isLoading,
    hasError: source.hasError,
    errorMessage: source.errorMessage,
    hasSsoConnection: Boolean(source.connection),
    status: source.directory ? (source.directory.enabled ? 'active' : 'inactive') : 'unconfigured',
    updateEnabled: source.setDirectoryEnabled,
    onDelete: source.deleteDirectory,
  } as const;
};
