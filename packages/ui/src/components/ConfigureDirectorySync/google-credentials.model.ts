import { readJSONFile } from '@clerk/shared/file';

import { localizationKeys, useLocalizations } from '@/customizables';

import { useConfigureDirectorySync } from './ConfigureDirectorySyncContext';

export const useGoogleCredentialsModel = () => {
  const { directory, directoryKey, canRun, setCredentials } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  return {
    requestKey: directoryKey,
    canRun,
    isConfigured: Boolean(directory?.credentialsConfigured),
    invalidKeyFileMessage: t(localizationKeys('configureDirectorySync.configureStep.error__invalidKeyFile')),
    readFile: readJSONFile,
    setCredentials,
  };
};

export const useGoogleCredentialsFormModel = () => {
  const { t } = useLocalizations();
  return {
    subjectEmailPlaceholder: t(
      localizationKeys('configureDirectorySync.configureStep.formFieldInputPlaceholder__subjectEmail'),
    ),
  };
};
