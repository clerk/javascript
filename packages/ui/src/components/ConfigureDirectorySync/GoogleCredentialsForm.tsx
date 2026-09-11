import { useCallback, useRef, useState } from 'react';

import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Input,
  localizationKeys,
  Text,
  useLocalizations,
} from '@/customizables';

import { useConfigureDirectorySync } from './ConfigureDirectorySyncContext';

// FileReader rather than Blob.text(), which Safari only gained in 14 and which
// clerk-js cannot assume. Mirrors fileToBase64 in AvatarUploader.
const fileToText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export type GoogleCredentialsState = {
  fileName: string | null;
  subjectEmail: string;
  fileError: string | null;
  isConfigured: boolean;
  /** Whether the step can be left: a credential is stored, or one is ready to send. */
  canContinue: boolean;
  setSubjectEmail: (value: string) => void;
  selectFile: (file: File | undefined) => Promise<void>;
  /** Sends the pending credential, if there is one. Rejects if the provider refuses it. */
  submit: () => Promise<void>;
};

/**
 * Holds the credential a pull-based directory reads the identity provider with.
 *
 * State lives here rather than inside the form so the step footer can drive it:
 * the wizard's Continue performs the submit, so the form has no button of its
 * own and there is only one way forward.
 */
export const useGoogleCredentialsState = (): GoogleCredentialsState => {
  const { directory, setCredentials } = useConfigureDirectorySync();
  const { t } = useLocalizations();

  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [subjectEmail, setSubjectEmail] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const isConfigured = Boolean(directory?.credentialsConfigured);
  const hasPendingCredential = Boolean(serviceAccountJson) && Boolean(subjectEmail);

  const selectFile = useCallback(
    async (file: File | undefined): Promise<void> => {
      if (!file) {
        return;
      }
      const contents = await fileToText(file);
      try {
        JSON.parse(contents);
      } catch {
        // Catch the obvious wrong-file case here; anything structurally valid is
        // the identity provider's to judge, and its message is better than ours.
        setServiceAccountJson('');
        setFileName(null);
        setFileError(t(localizationKeys('configureDirectorySync.configureStep.error__invalidKeyFile')));
        return;
      }
      setFileError(null);
      setServiceAccountJson(contents);
      setFileName(file.name);
    },
    [t],
  );

  const submit = useCallback(async (): Promise<void> => {
    if (!hasPendingCredential) {
      return;
    }
    await setCredentials({ serviceAccountJson, subjectEmail });
    // Drop the key as soon as it has been accepted. Nothing in this flow needs
    // it again, and holding it only widens where it can leak from.
    setServiceAccountJson('');
    setFileName(null);
  }, [hasPendingCredential, setCredentials, serviceAccountJson, subjectEmail]);

  return {
    fileName,
    subjectEmail,
    fileError,
    isConfigured,
    canContinue: isConfigured || hasPendingCredential,
    setSubjectEmail,
    selectFile,
    submit,
  };
};

/**
 * Collects the service account key and the administrator it impersonates. The
 * key is never held in wizard state, which outlives the request.
 */
export const GoogleCredentialsForm = ({ state }: { state: GoogleCredentialsState }): JSX.Element => {
  const { t } = useLocalizations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileName, subjectEmail, fileError, isConfigured, setSubjectEmail, selectFile } = state;

  return (
    <Col
      elementDescriptor={descriptors.configureDirectorySyncCredentialsForm}
      sx={t => ({ gap: t.space.$5 })}
    >
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        <Text
          as='span'
          localizationKey={localizationKeys('configureDirectorySync.configureStep.formFieldLabel__serviceAccountKey')}
          sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
        />
        <Badge
          elementDescriptor={descriptors.configureDirectorySyncCredentialsBadge}
          colorScheme={isConfigured ? 'success' : 'warning'}
          localizationKey={localizationKeys(
            isConfigured
              ? 'configureDirectorySync.configureStep.badge__credentialsConfigured'
              : 'configureDirectorySync.configureStep.badge__credentialsMissing',
          )}
        />
      </Flex>

      <Col sx={t => ({ gap: t.space.$1x5 })}>
        <input
          ref={fileInputRef}
          type='file'
          accept='application/json,.json'
          hidden
          onChange={event => void selectFile(event.target.files?.[0])}
        />
        <Flex
          align='center'
          sx={t => ({ gap: t.space.$2 })}
        >
          <Button
            elementDescriptor={descriptors.configureDirectorySyncUploadKeyButton}
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            localizationKey={localizationKeys(
              fileName
                ? 'configureDirectorySync.configureStep.actionLabel__replaceKey'
                : 'configureDirectorySync.configureStep.actionLabel__uploadKey',
            )}
          />
          {fileName && (
            <Text
              elementDescriptor={descriptors.configureDirectorySyncUploadedFileName}
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              {fileName}
            </Text>
          )}
        </Flex>
        {fileError && (
          <Text
            as='span'
            colorScheme='danger'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {fileError}
          </Text>
        )}
      </Col>

      <Col sx={t => ({ gap: t.space.$1x5 })}>
        <Text
          as='span'
          localizationKey={localizationKeys('configureDirectorySync.configureStep.formFieldLabel__subjectEmail')}
          sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
        />
        <Input
          elementDescriptor={descriptors.configureDirectorySyncSubjectEmailInput}
          type='email'
          value={subjectEmail}
          onChange={event => setSubjectEmail(event.target.value)}
          placeholder={t(
            localizationKeys('configureDirectorySync.configureStep.formFieldInputPlaceholder__subjectEmail'),
          )}
        />
        <Text
          as='span'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureDirectorySync.configureStep.formFieldHint__subjectEmail')}
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        />
      </Col>
    </Col>
  );
};
