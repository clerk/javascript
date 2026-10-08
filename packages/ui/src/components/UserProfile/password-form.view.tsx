import { localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { InformationBox } from '@/ui/elements/InformationBox';

import type { usePasswordFormController } from './password-form.controller';

type Controller = ReturnType<typeof usePasswordFormController>;

export const PasswordFormView = ({ controller }: { controller: Controller }) => (
  <FormContainer headerTitle={controller.title}>
    {controller.passwordEditDisabled && (
      <InformationBox message={localizationKeys('userProfile.passwordPage.readonly')} />
    )}

    <Form.Root
      onSubmit={controller.updatePassword}
      onBlur={controller.validateForm}
    >
      {/* For password managers */}
      <input
        readOnly
        data-testid='hidden-identifier'
        id='identifier-field'
        name='identifier'
        value={controller.identifier}
        style={{ display: 'none' }}
      />
      {controller.currentPasswordRequired && (
        <Form.ControlRow elementId={controller.currentPasswordField.id}>
          <Form.PasswordInput
            {...controller.currentPasswordField.props}
            minLength={6}
            isRequired
            autoFocus
            isDisabled={controller.passwordEditDisabled}
          />
        </Form.ControlRow>
      )}
      <Form.ControlRow elementId={controller.passwordField.id}>
        <Form.PasswordInput
          {...controller.passwordField.props}
          minLength={6}
          isRequired
          autoFocus={!controller.passwordEnabled}
          isDisabled={controller.passwordEditDisabled}
          autoComplete='new-password'
        />
      </Form.ControlRow>
      <Form.ControlRow elementId={controller.confirmField.id}>
        <Form.PasswordInput
          {...controller.confirmField.props}
          onChange={controller.onConfirmChange}
          isRequired
          isDisabled={controller.passwordEditDisabled}
          autoComplete='new-password'
        />
      </Form.ControlRow>
      <Form.ControlRow elementId={controller.sessionsField.id}>
        <Form.Checkbox
          {...controller.sessionsField.props}
          description={localizationKeys('userProfile.passwordPage.checkboxInfoText__signOutOfOtherSessions')}
          isDisabled={controller.passwordEditDisabled}
        />
      </Form.ControlRow>
      {controller.passwordEditDisabled ? (
        <FormButtonContainer>
          <Form.ResetButton
            localizationKey={localizationKeys('userProfile.formButtonReset')}
            block={false}
            onClick={controller.onReset}
          />
        </FormButtonContainer>
      ) : (
        <FormButtons
          isDisabled={!controller.canSubmit}
          onReset={controller.onReset}
        />
      )}
    </Form.Root>
  </FormContainer>
);
