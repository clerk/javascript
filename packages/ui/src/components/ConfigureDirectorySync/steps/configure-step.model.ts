import { localizationKeys, useLocalizations } from '@/customizables';

import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';
import { useGoogleCredentialsState } from '../GoogleCredentialsForm';

export const useConfigureStepModel = () => {
  const {
    requestKey,
    directoryKey,
    canRun,
    connection,
    providerMeta,
    directory,
    createDirectory,
    revealedToken,
    rotateToken,
  } = useConfigureDirectorySync();
  const { t } = useLocalizations();

  // Pull providers hand Clerk a credential instead of receiving a token, so the
  // directory still has to exist first — it is what the credential attaches to.
  const isPull = providerMeta?.mode === 'pull';
  const credentials = useGoogleCredentialsState();
  const canProvision = Boolean(connection);

  return {
    requestKey,
    directoryKey,
    canRun,
    connection: connection
      ? { name: connection.name, active: connection.active, domains: connection.domains ?? [] }
      : undefined,
    providerName: providerMeta?.name,
    instructions: providerMeta?.instructions ?? [],
    directory: directory ? { endpointUrl: directory.endpointUrl } : directory,
    revealedToken,
    createDirectory,
    rotateToken,
    isPull,
    credentials,
    canProvision,
    tokenPlaceholder: t(localizationKeys('configureDirectorySync.configureStep.formFieldInputPlaceholder__token')),
  };
};
