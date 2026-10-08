import { Badge, Button, Col, descriptors, Flex, Input, localizationKeys, Text } from '@/customizables';

import type { useGoogleCredentialsFormModel } from './google-credentials.model';
import type { GoogleCredentialsState } from './GoogleCredentialsForm';

export const GoogleCredentialsFormView = ({
  state,
  fileInputRef,
  subjectEmailPlaceholder,
}: {
  state: GoogleCredentialsState;
  fileInputRef: React.RefObject<HTMLInputElement>;
} & ReturnType<typeof useGoogleCredentialsFormModel>): JSX.Element => {
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
          placeholder={subjectEmailPlaceholder}
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
