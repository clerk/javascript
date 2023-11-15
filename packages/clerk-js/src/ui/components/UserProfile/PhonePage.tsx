import type { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { VerifyWithCode } from './VerifyWithCode';

export const PhonePage = withCardStateProvider(() => {
  const user = useCoreUser();

  const { params } = useRouter();
  const { id } = params || {};

  const phoneNumberRef = React.useRef<PhoneNumberResource | undefined>(user.phoneNumbers.find(a => a.id === id));
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
        Breadcrumbs={UserProfileBreadcrumbs}
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
  const card = useCardState();
  const user = useCoreUser();

  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const canSubmit = phoneField.value.length > 1 && user.username !== phoneField.value;

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    return user
      .createPhoneNumber({ phoneNumber: phoneField.value })
      .then(res => {
        resourceRef.current = res;
        onSuccess();
      })
      .catch(e => handleError(e, [phoneField], card.setError));
  };

  return (
    <ContentPage
      headerTitle={title}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Form.Root onSubmit={addPhone}>
        <Form.ControlRow elementId={phoneField.id}>
          <Form.Control
            {...phoneField.props}
            required
            autoFocus
          />
        </Form.ControlRow>
        <Text
          variant='regularRegular'
          localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText')}
        />
        <Text
          variant='smallRegular'
          colorScheme='neutral'
          localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText__secondary')}
        />
        <FormButtons isDisabled={!canSubmit} />
      </Form.Root>
    </ContentPage>
  );
};

export const VerifyPhone = (props: AddPhoneProps) => {
  const { title, onSuccess, resourceRef } = props;

  return (
    <ContentPage
      headerTitle={title}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <VerifyWithCode
        nextStep={onSuccess}
        identification={resourceRef.current}
        identifier={resourceRef.current?.phoneNumber}
        prepareVerification={resourceRef.current?.prepareVerification}
      />
    </ContentPage>
  );
};
