import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { localizationKeys, Text } from '../../customizables';
import { Form, FormButtons, FormContent, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError, useFormControl } from '../../utils';
import { VerifyWithCode } from './VerifyWithCode';

type PhoneFormProps = {
  phoneId?: string;
};

export const PhoneForm = withCardStateProvider((props: PhoneFormProps) => {
  const { phoneId: id } = props;
  const { user } = useUser();
  const { close } = useActionContext();

  const phoneNumberRef = React.useRef<PhoneNumberResource | undefined>(user?.phoneNumbers.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: phoneNumberRef.current ? 1 : 0 });

  return (
    <Wizard {...wizard.props}>
      <AddPhone
        resourceRef={phoneNumberRef}
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        onSuccess={wizard.nextStep}
      />
      <VerifyPhone
        resourceRef={phoneNumberRef}
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        onSuccess={wizard.nextStep}
      />
      <SuccessPage
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        text={localizationKeys('userProfile.phoneNumberPage.successMessage', {
          identifier: phoneNumberRef.current?.phoneNumber || '',
        })}
        onFinish={close}
      />
    </Wizard>
  );
});

type AddPhoneProps = {
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onSuccess: () => void;
};

export const AddPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, resourceRef } = props;
  const { close } = useActionContext();
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
    <FormContent headerTitle={title}>
      <Form.Root onSubmit={addPhone}>
        <Form.ControlRow elementId={phoneField.id}>
          <Form.PhoneInput
            {...phoneField.props}
            autoFocus
          />
        </Form.ControlRow>
        <Text localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText')} />
        <Text
          colorScheme='neutral'
          localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText__secondary')}
        />
        <FormButtons
          isDisabled={!canSubmit}
          onReset={close}
        />
      </Form.Root>
    </FormContent>
  );
};

export const VerifyPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, resourceRef } = props;
  const { close } = useActionContext();

  return (
    <FormContent headerTitle={title}>
      <VerifyWithCode
        nextStep={onSuccess}
        identification={resourceRef.current}
        identifier={resourceRef.current?.phoneNumber}
        prepareVerification={resourceRef.current?.prepareVerification}
        onReset={close}
      />
    </FormContent>
  );
};
