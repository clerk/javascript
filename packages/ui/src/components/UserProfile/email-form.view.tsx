import type { ReactNode } from 'react';

import { Wizard } from '@/ui/common';
import { localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { useEmailFormController } from './email-form.controller';

type Controller = ReturnType<typeof useEmailFormController>;

const getTranslationKeyByStrategy = (strategy: Controller['strategy']) => {
  switch (strategy) {
    case 'email_code':
      return 'userProfile.emailAddressPage.emailCode';
    case 'enterprise_sso':
      return 'userProfile.emailAddressPage.enterpriseSSOLink';
    case 'email_link':
      return 'userProfile.emailAddressPage.emailLink';
    default:
      throw new Error(`Unsupported strategy for email verification: ${strategy}`);
  }
};

export const EmailFormView = ({
  controller,
  verification,
}: {
  controller: Controller;
  verification: { emailCode: ReactNode; emailLink: ReactNode; enterpriseSso: ReactNode };
}) => {
  const translationKey = getTranslationKeyByStrategy(controller.strategy);

  return (
    <Wizard {...controller.wizardProps}>
      <FormContainer
        headerTitle={controller.title || localizationKeys('userProfile.emailAddressPage.title')}
        headerSubtitle={controller.subtitle || localizationKeys('userProfile.emailAddressPage.formHint')}
      >
        <Form.Root onSubmit={controller.addEmail}>
          <Form.ControlRow elementId={controller.emailField.id}>
            <Form.PlainInput
              {...controller.emailField.props}
              autoFocus={!controller.disableAutoFocus}
            />
          </Form.ControlRow>
          <FormButtons
            submitLabel={localizationKeys('userProfile.formButtonPrimary__add')}
            isDisabled={!controller.canSubmit}
            onReset={controller.onReset}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={localizationKeys('userProfile.emailAddressPage.verifyTitle')}
        headerSubtitle={localizationKeys(`${translationKey}.formSubtitle`, { identifier: controller.identifier })}
      >
        {controller.strategy === 'email_link' && verification.emailLink}
        {controller.strategy === 'email_code' && verification.emailCode}
        {controller.strategy === 'enterprise_sso' && verification.enterpriseSso}
      </FormContainer>
    </Wizard>
  );
};
