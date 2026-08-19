import { useState } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { CalloutWithAction } from '../../../common';
import { useEnvironment } from '../../../contexts';
import { Button, Text } from '../../../customizables';
import { InformationCircle } from '../../../icons';
import { EnrollmentOptions } from './EnrollmentOptions';
import type { ProtoDomain, ProtoEnrollment } from './prototypeState';
import { protoKey, simulateRequest, useAccessOnboarding } from './prototypeState';

type ManageDomainFormProps = {
  domain: ProtoDomain;
  onClose: () => void;
};

export const ManageDomainForm = withCardStateProvider(({ domain, onClose }: ManageDomainFormProps) => {
  const { dispatch } = useAccessOnboarding();
  const { displayConfig } = useEnvironment();
  const [enrollment, setEnrollment] = useState<ProtoEnrollment>(domain.enrollment);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      dispatch({ type: 'setEnrollment', id: domain.id, enrollment });
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
      />
      <FormButtonContainer>
        <Button
          block={false}
          isLoading={isSaving}
          isDisabled={enrollment === domain.enrollment}
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
