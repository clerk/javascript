import { useState } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { CalloutWithAction } from '../../../common';
import { useEnvironment } from '../../../contexts';
import { Button, Col, Flex, RadioInput, Text } from '../../../customizables';
import { InformationCircle } from '../../../icons';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoDomain, ProtoEnrollment, ProtoNonDirectoryFallback } from './prototypeState';
import { NON_DIRECTORY_FALLBACK_LABELS, protoKey, simulateRequest, useAccessOnboarding } from './prototypeState';

type ManageDomainFormProps = {
  domain: ProtoDomain;
  onClose: () => void;
};

export const ManageDomainForm = withCardStateProvider(({ domain, onClose }: ManageDomainFormProps) => {
  const { dispatch } = useAccessOnboarding();
  const { displayConfig } = useEnvironment();
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>(domain.enrollment);
  const [nonDirectoryFallback, setNonDirectoryFallback] = useState<ProtoNonDirectoryFallback>(
    domain.nonDirectoryFallback,
  );
  const [isSaving, setIsSaving] = useState(false);

  const onSave = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      dispatch({
        type: 'configureRule',
        id: domain.id,
        enrollment,
        twoStepRequired: domain.twoStepRequired,
        sessionLifetimeHours: domain.sessionLifetimeHours,
        nonDirectoryFallback,
        ssoProvider: domain.authentication.mode === 'sso' ? domain.authentication.provider : null,
      });
      setIsSaving(false);
      onClose();
    });
  };

  return (
    <FormContainer
      headerTitle={protoKey(`Manage ${domain.name}`)}
      headerSubtitle={protoKey('Choose how people with an email at this domain join the organization.')}
    >
      {domain.ownership === 'waived' ? (
        <CalloutWithAction icon={InformationCircle}>
          <Text as='span'>
            {`Ownership verification was waived by ${displayConfig.applicationName} — no DNS record was checked.`}
          </Text>
        </CalloutWithAction>
      ) : null}
      <EnrollmentOptions
        domain={domain}
        value={enrollment}
        onChange={setEnrollment}
        signInMode={domain.authentication.mode}
      />
      {enrollment === 'directory_synced' ? (
        <Col
          sx={t => ({
            gap: t.space.$2,
            paddingInlineStart: t.space.$4,
            borderInlineStart: `1px solid ${t.colors.$borderAlpha150}`,
          })}
        >
          <Col sx={t => ({ gap: t.space.$0x5 })}>
            <Text
              as='span'
              variant='subtitle'
            >
              Outside the directory
            </Text>
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              {`Someone with an @${domain.name} email who is not in the directory.`}
            </Text>
          </Col>
          {(Object.keys(NON_DIRECTORY_FALLBACK_LABELS) as ProtoNonDirectoryFallback[]).map(fallback => (
            <Flex
              key={fallback}
              as='label'
              align='start'
              sx={t => ({ gap: t.space.$2, cursor: 'pointer' })}
            >
              <RadioInput
                name='protoNonDirectoryFallback'
                value={fallback}
                checked={nonDirectoryFallback === fallback}
                onChange={() => setNonDirectoryFallback(fallback)}
                sx={t => ({ marginTop: t.space.$0x5 })}
              />
              <Col sx={t => ({ gap: t.space.$0x5 })}>
                <Text as='span'>{NON_DIRECTORY_FALLBACK_LABELS[fallback].label}</Text>
                <Text
                  as='span'
                  colorScheme='secondary'
                  sx={t => ({ fontSize: t.fontSizes.$sm })}
                >
                  {NON_DIRECTORY_FALLBACK_LABELS[fallback].description}
                </Text>
              </Col>
            </Flex>
          ))}
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            You will finish directory sync from your identity provider.
          </Text>
        </Col>
      ) : null}
      {domain.membershipRequired ? (
        <Text
          colorScheme='secondary'
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        >
          {`Membership is required for this domain, set by ${displayConfig.applicationName}. Members need to belong to at least one organization.`}
        </Text>
      ) : null}
      <FormButtonContainer>
        <Button
          block={false}
          isLoading={isSaving}
          isDisabled={enrollment === domain.enrollment && nonDirectoryFallback === domain.nonDirectoryFallback}
          onClick={onSave}
          localizationKey={protoKey('Save')}
        />
        <Button
          block={false}
          variant='ghost'
          textVariant='buttonSmall'
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
      </FormButtonContainer>
    </FormContainer>
  );
});
