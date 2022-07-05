import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { useWizard, Wizard } from '../common';
import { Text } from '../customizables';
import { Form, useCardState, withCardStateProvider } from '../elements';
import { handleError, useFormControl } from '../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';
import { VerifyWithCode } from './VerifyWithCode';

export const PhonePage = withCardStateProvider(() => {
  const title = 'Add phone number';
  const card = useCardState();
  const user = useCoreUser();

  const { params } = useRouter();
  const { id } = params || {};

  const phoneNumberRef = React.useRef<PhoneNumberResource | undefined>(user.phoneNumbers.find(a => a.id === id));
  const wizard = useWizard({ defaultStep: phoneNumberRef.current ? 1 : 0 });

  const phoneField = useFormControl('phoneNumber', `6981593069`, {
    type: 'tel',
    label: 'Phone number',
  });

  const canSubmit = phoneField.value.length > 1 && user.username !== phoneField.value;

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    return user
      .createPhoneNumber({ phoneNumber: phoneField.value })
      .then(res => {
        phoneNumberRef.current = res;
        wizard.nextStep();
      })
      .catch(e => handleError(e, [phoneField], card.setError));
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={addPhone}>
          <Form.ControlRow>
            <Form.Control
              {...phoneField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Text variant='regularRegular'>
            A text message containing a verification link will be sent to this phone number.
          </Text>
          <Text
            variant='smallRegular'
            colorScheme='neutral'
          >
            Message and data rates may apply.
          </Text>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage.Root>

      <ContentPage.Root headerTitle={title}>
        <VerifyWithCode
          nextStep={wizard.nextStep}
          identification={phoneNumberRef.current}
          identifier={phoneNumberRef.current?.phoneNumber}
          prepareVerification={phoneNumberRef.current?.prepareVerification}
        />
      </ContentPage.Root>

      <SuccessPage
        title={title}
        text={`${phoneNumberRef.current?.phoneNumber || ''} has been added to your account.`}
      />
    </Wizard>
  );
});
