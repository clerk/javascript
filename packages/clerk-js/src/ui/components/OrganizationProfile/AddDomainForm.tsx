import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { VerifyDomainForm } from './VerifyDomainForm';

type AddDomainFormProps = FormProps;

export const AddDomainForm = withCardStateProvider((props: AddDomainFormProps) => {
  const { onSuccess, onReset } = props;
  const { organizationSettings } = useEnvironment();
  const { domains } = useOrganization({
    domains: {
      infinite: true,
    },
  });
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const [domainId, setDomainId] = useState('');
  const [verified, setVerified] = useState(false);
  const title = localizationKeys('organizationProfile.createDomainPage.title');
  const subtitle = localizationKeys('organizationProfile.createDomainPage.subtitle');
  const card = useCardState();
  const { organization } = useOrganization();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationDomain'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationDomain'),
  });

  if (!organization || !organizationSettings) {
    return null;
  }

  const canSubmit = nameField.value.trim() !== '';

  const onSubmit = (e: React.FormEvent) => {
    nameField.clearFeedback();
    e.preventDefault();
    return organization
      .createDomain(nameField.value)
      .then(async res => {
        setDomainId(res.id);
        domains?.revalidate?.();
        if (res.verification && res.verification.status === 'verified') {
          setVerified(true);
        }
        wizard.nextStep();
      })
      .catch(err => {
        handleError(err, [nameField], card.setError);
      });
  };

  return (
    <Wizard {...wizard.props}>
      <FormContainer
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              autoFocus
              ignorePasswordManager
              isRequired
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>

      <VerifyDomainForm
        domainId={domainId}
        onSuccess={() => {
          domains?.revalidate?.();
          onSuccess?.();
        }}
        skipToVerified={verified}
        onReset={onReset}
      />
    </Wizard>
  );
});
