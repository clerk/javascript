import { localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { useUsernameFormController } from './username-form.controller';

type Controller = ReturnType<typeof useUsernameFormController>;

export const UsernameFormView = ({ controller }: { controller: Controller }) => (
  <FormContainer
    headerTitle={
      controller.username
        ? localizationKeys('userProfile.usernamePage.title__update')
        : localizationKeys('userProfile.usernamePage.title__set')
    }
  >
    <Form.Root onSubmit={controller.submitUpdate}>
      <Form.ControlRow elementId={controller.usernameField.id}>
        <Form.PlainInput
          {...controller.usernameField.props}
          autoFocus
          isRequired={controller.isUsernameRequired}
        />
      </Form.ControlRow>
      <FormButtons
        isDisabled={!controller.canSubmit}
        onReset={controller.onReset}
      />
    </Form.Root>
  </FormContainer>
);
