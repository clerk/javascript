import { useState } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { useFormControl } from '@/ui/utils/useFormControl';

import { CalloutWithAction } from '../../../common';
import { useEnvironment } from '../../../contexts';
import { Button, Col, Text } from '../../../customizables';
import { InformationCircle } from '../../../icons';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoDomain, ProtoEnrollment, ProtoNonDirectoryFallback } from './prototypeState';
import {
  NON_DIRECTORY_FALLBACK_LABELS,
  protoFieldId,
  protoKey,
  simulateRequest,
  useAccessOnboarding,
} from './prototypeState';

type ManageDomainFormProps = {
  domain: ProtoDomain;
  onClose: () => void;
};

export const ManageDomainForm = withCardStateProvider(({ domain, onClose }: ManageDomainFormProps) => {
  const { dispatch } = useAccessOnboarding();
  const { displayConfig } = useEnvironment();
  const [isSaving, setIsSaving] = useState(false);

  const enrollmentField = useFormControl(protoFieldId('enrollment'), domain.enrollment, {
    type: 'radio',
    radioOptions: [],
  });

  const fallbackField = useFormControl(protoFieldId('nonDirectoryFallback'), domain.nonDirectoryFallback, {
    type: 'radio',
    radioOptions: (Object.keys(NON_DIRECTORY_FALLBACK_LABELS) as ProtoNonDirectoryFallback[]).map(value => ({
      value,
      label: NON_DIRECTORY_FALLBACK_LABELS[value].label,
      description: NON_DIRECTORY_FALLBACK_LABELS[value].description,
    })),
  });

  const onSave = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      dispatch({
        type: 'configureRule',
        id: domain.id,
        enrollment: enrollmentField.value as ProtoEnrollment,
        twoStepRequired: domain.twoStepRequired,
        sessionLifetimeHours: domain.sessionLifetimeHours,
        nonDirectoryFallback: fallbackField.value as ProtoNonDirectoryFallback,
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
        signInMode={domain.authentication.mode}
        field={enrollmentField}
      />
      {enrollmentField.value === 'directory_synced' ? (
        <Col sx={t => ({ gap: t.space.$1x5 })}>
          <Col sx={t => ({ gap: t.space.$0x5 })}>
            <Text variant='subtitle'>Outside the directory</Text>
            <Text
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              {`Someone with an @${domain.name} email who is not in the directory.`}
            </Text>
          </Col>
          <Form.RadioGroup {...fallbackField.props} />
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
          isDisabled={
            enrollmentField.value === domain.enrollment && fallbackField.value === domain.nonDirectoryFallback
          }
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
