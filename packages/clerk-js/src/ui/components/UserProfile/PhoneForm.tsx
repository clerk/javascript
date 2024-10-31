import { __experimental_useReverification as useReverification, useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import { Button, Flex, localizationKeys, Text } from '../../customizables';
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
        title={localizationKeys('userProfile.phoneNumberPage.title')}
        onSuccess={wizard.nextStep}
        onReset={onReset}
      />
      <VerifyPhone
        resourceRef={phoneNumberRef}
        title={localizationKeys('userProfile.phoneNumberPage.verifyTitle')}
        onSuccess={onSuccess}
        onReset={onReset}
      />
    </Wizard>
  );
});

type AddPhoneProps = FormProps & {
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
  onUseExistingNumberClick?: React.MouseEventHandler;
};

export const AddPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, onReset, onUseExistingNumberClick, resourceRef } = props;
  const card = useCardState();
  const { user } = useUser();
  const [createPhoneNumber] = useReverification(() => {
    if (!user) {
      return Promise.resolve(undefined);
    }
    return user.createPhoneNumber({ phoneNumber: phoneField.value });
  });

  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const canSubmit = phoneField.value.length > 1 && user?.username !== phoneField.value;
  const hasExistingNumber = !!user?.phoneNumbers?.length && onUseExistingNumberClick;

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    return createPhoneNumber()
      .then(res => {
        resourceRef.current = res;
        onSuccess();
      })
      .catch(e => handleError(e, [phoneField], card.setError));
  };

  return (
    <FormContainer
      headerTitle={title}
      gap={1}
    >
      <Form.Root
        gap={4}
        onSubmit={addPhone}
      >
        <Text
          localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText')}
          colorScheme='secondary'
        />
        <Form.ControlRow elementId={phoneField.id}>
          <Form.PhoneInput
            {...phoneField.props}
            autoFocus
          />
        </Form.ControlRow>
        <Flex justify={hasExistingNumber ? 'between' : 'end'}>
          {hasExistingNumber && (
            <Button
              variant='ghost'
              localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.backButton')}
              onClick={onUseExistingNumberClick}
            />
          )}

          <FormButtons
            submitLabel={localizationKeys('userProfile.formButtonPrimary__add')}
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Flex>
      </Form.Root>
    </FormContainer>
  );
};

type VerifyPhoneProps = FormProps & {
  title: LocalizationKey;
  resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};

export const VerifyPhone = (props: VerifyPhoneProps) => {
  const { title, onSuccess, resourceRef, onReset } = props;

  return (
    <FormContainer
      headerTitle={title}
      headerSubtitle={localizationKeys('userProfile.phoneNumberPage.verifySubtitle', {
        identifier: resourceRef.current?.phoneNumber,
      })}
    >
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
