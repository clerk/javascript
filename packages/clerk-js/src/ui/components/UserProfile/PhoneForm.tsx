import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { VerifyWithCode } from './VerifyWithCode';

type PhoneFormProps = FormProps & {
  phoneId?: string;
};

export const PhoneForm = withCardStateProvider((props: PhoneFormProps) => {
  const { phoneId: id, onSuccess, onReset } = props;
  const { user } = useUser();

  const phoneNumberRef = React.useRef<PhoneNumberResource | undefined>(user?.phoneNumbers.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: phoneNumberRef.current ? 1 : 0 });

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        resourceRef={phoneNumberRef}
        title={localizationKeys('userProfile.profile.phoneNumbersSection.phoneNumberScreen.title')}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />
      <VerifyPhone
        resourceRef={phoneNumberRef}
        title={localizationKeys('userProfile.profile.phoneNumbersSection.phoneNumberScreen.title')}
        onSuccess={onSuccess}
        onReset={wizard.prevStep}
      />
    </Wizard>
  );
});

type AddPhoneProps = FormProps & {
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

export const AddPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, onReset, resourceRef } = props;
  const card = useCardState();
  const { user } = useUser();

  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const canSubmit = phoneField.value.length > 1 && user?.username !== phoneField.value;

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    return user
      ?.createPhoneNumber({ phoneNumber: phoneField.value })
      .then(res => {
        resourceRef.current = res;
        onSuccess();
      })
      .catch(e => handleError(e, [phoneField], card.setError));
  };

  return (
    <FormContainer headerTitle={title}>
      <Form.Root onSubmit={addPhone}>
        <Form.ControlRow elementId={phoneField.id}>
          <Form.PhoneInput
            {...phoneField.props}
            autoFocus
          />
        </Form.ControlRow>
        <Text
          localizationKey={localizationKeys('userProfile.profile.phoneNumbersSection.phoneNumberScreen.infoText')}
        />
        <Text
          colorScheme='neutral'
          localizationKey={localizationKeys(
            'userProfile.profile.phoneNumbersSection.phoneNumberScreen.infoText__secondary',
          )}
        />
        <FormButtons
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
};

export const VerifyPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, resourceRef, onReset } = props;

  return (
    <FormContainer headerTitle={title}>
      <VerifyWithCode
        nextStep={onSuccess}
        identification={resourceRef.current}
        identifier={resourceRef.current?.phoneNumber}
        prepareVerification={resourceRef.current?.prepareVerification}
        onReset={onReset}
      />
    </FormContainer>
  );
};
