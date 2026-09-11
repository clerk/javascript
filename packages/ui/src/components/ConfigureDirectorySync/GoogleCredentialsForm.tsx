import { useRef, useState } from 'react';

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
import { useCardState } from '@/elements/contexts';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

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

/**
 * Collects the credential a pull-based directory reads the identity provider
 * with: the service account key and the administrator it impersonates.
 *
 * The key never leaves this component except as the request body — it is not
 * held in wizard state, because wizard state outlives the request.
 */
export const GoogleCredentialsForm = (): JSX.Element => {
  const { directory, setCredentials } = useConfigureDirectorySync();
  const { t } = useLocalizations();
  const card = useCardState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [subjectEmail, setSubjectEmail] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const isConfigured = Boolean(directory?.credentialsConfigured);
  const canSubmit = Boolean(serviceAccountJson) && Boolean(subjectEmail) && !card.isLoading;

  const onFileSelected = async (file: File | undefined): Promise<void> => {
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
  };

  const onSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }
    card.setError(undefined);
    card.setLoading();
    try {
      await setCredentials({ serviceAccountJson, subjectEmail });
      // Drop the key as soon as it has been accepted. Nothing in this flow
      // needs it again, and holding it only widens where it can leak from.
      setServiceAccountJson('');
      setFileName(null);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

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
          onChange={event => void onFileSelected(event.target.files?.[0])}
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

      {card.error && (
        <Alert
          variant='danger'
          title={card.error}
        />
      )}

      <Flex>
        <Button
          elementDescriptor={descriptors.configureDirectorySyncSaveCredentialsButton}
          variant='solid'
          size='sm'
          isDisabled={!canSubmit}
          isLoading={card.isLoading}
          onClick={() => void onSubmit()}
          localizationKey={localizationKeys(
            isConfigured
              ? 'configureDirectorySync.configureStep.actionLabel__updateCredentials'
              : 'configureDirectorySync.configureStep.actionLabel__saveCredentials',
          )}
        />
      </Flex>
    </Col>
  );
};
