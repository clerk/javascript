import { useConfigureDirectorySync } from './ConfigureDirectorySyncContext';

export const useConfigureDirectorySyncWizardModel = () => {
  const { connection, directory, isLoading } = useConfigureDirectorySync();
  return {
    hasSsoConnection: Boolean(connection),
    hasDirectory: Boolean(directory),
    isLoading,
  };
};
