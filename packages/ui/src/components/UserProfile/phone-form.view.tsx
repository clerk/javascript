import type { ReactNode } from 'react';

import { Wizard } from '@/ui/common';
import { Button, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '@/ui/localization';

import type { AddPhoneViewData } from './phone-form.types';

export const PhoneFormView = ({
  wizardProps,
  addPhone,
  verifyPhone,
}: {
  wizardProps: { step: number };
  addPhone: ReactNode;
  verifyPhone: ReactNode;
}) => (
  <Wizard {...wizardProps}>
    {addPhone}
    {verifyPhone}
  </Wizard>
);

export const AddPhoneView = ({ controller }: { controller: AddPhoneViewData }) => (
  <FormContainer
    headerTitle={controller.title}
    gap={1}
  >
    <Form.Root
      gap={4}
      onSubmit={controller.addPhone}
    >
      <Text
        localizationKey={localizationKeys('userProfile.phoneNumberPage.infoText')}
        colorScheme='secondary'
      />
      <Form.ControlRow elementId={controller.phoneField.id}>
        <Form.PhoneInput
          {...controller.phoneField.props}
          autoFocus
        />
      </Form.ControlRow>
      <Flex justify={controller.hasExistingNumber ? 'between' : 'end'}>
        {controller.hasExistingNumber && (
          <Button
            variant='ghost'
            localizationKey={localizationKeys('userProfile.mfaPhoneCodePage.backButton')}
            onClick={controller.onUseExistingNumberClick}
          />
        )}
        <FormButtons
          submitLabel={localizationKeys('userProfile.formButtonPrimary__add')}
          isDisabled={!controller.canSubmit}
          onReset={controller.onReset}
        />
      </Flex>
    </Form.Root>
  </FormContainer>
);

export const VerifyPhoneView = ({
  title,
  identifier,
  verification,
}: {
  title: LocalizationKey;
  identifier: string;
  verification: ReactNode;
}) => (
  <FormContainer
    headerTitle={title}
    headerSubtitle={localizationKeys('userProfile.phoneNumberPage.verifySubtitle', { identifier })}
  >
    {verification}
  </FormContainer>
);
