import { Wizard } from '@/common';
import { localizationKeys } from '@/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { AddDomainFormData } from './add-domain-form.types';
import { VerifyDomainForm } from './VerifyDomainForm';

export const AddDomainFormView = ({
  controller,
  onReset,
}: {
  controller: AddDomainFormData;
  onReset: FormProps['onReset'];
}) => (
  <Wizard {...controller.wizardProps}>
    <FormContainer
      headerTitle={localizationKeys('organizationProfile.createDomainPage.title')}
      headerSubtitle={localizationKeys('organizationProfile.createDomainPage.subtitle')}
    >
      <Form.Root onSubmit={controller.onSubmit}>
        <Form.ControlRow elementId={controller.nameField.id}>
          <Form.PlainInput
            {...controller.nameField.props}
            autoFocus
            ignorePasswordManager
            isRequired
          />
        </Form.ControlRow>
        <FormButtons
          isDisabled={!controller.canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>

    <VerifyDomainForm
      domainId={controller.domainId}
      onSuccess={() => void controller.onVerifySuccess()}
      skipToVerified={controller.verified}
      onReset={onReset}
    />
  </Wizard>
);
