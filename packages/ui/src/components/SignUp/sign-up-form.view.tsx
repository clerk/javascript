import { Form } from '@/ui/elements/Form';
import { LegalCheckbox } from '@/ui/elements/LegalConsentCheckbox';

import { Col, localizationKeys } from '../../customizables';
import { mqu } from '../../styledSystem';
import type { useSignUpFormController } from './sign-up-form.controller';

export const SignUpFormView = ({
  handleSubmit,
  fields,
  formState,
  canToggleEmailPhone,
  onlyLegalAcceptedMissing,
  visible,
  onUsePhone,
  onUseEmail,
}: ReturnType<typeof useSignUpFormController>): JSX.Element => {
  return (
    <Form.Root
      onSubmit={handleSubmit}
      gap={8}
    >
      {!onlyLegalAcceptedMissing && (
        <Col gap={6}>
          {(visible.firstName || visible.lastName) && (
            <Form.ControlRow
              elementId='name'
              sx={{
                [mqu.sm]: {
                  flexWrap: 'wrap',
                },
              }}
            >
              {visible.firstName && (
                <Form.PlainInput
                  {...formState.firstName.props}
                  isRequired={fields.firstName?.required}
                  isOptional={!fields.firstName?.required}
                />
              )}
              {visible.lastName && (
                <Form.PlainInput
                  {...formState.lastName.props}
                  isRequired={fields.lastName?.required}
                  isOptional={!fields.lastName?.required}
                />
              )}
            </Form.ControlRow>
          )}
          {visible.username && (
            <Form.ControlRow elementId='username'>
              <Form.PlainInput
                {...formState.username.props}
                isRequired={fields.username?.required}
                isOptional={!fields.username?.required}
              />
            </Form.ControlRow>
          )}
          {visible.emailAddress && (
            <Form.ControlRow elementId='emailAddress'>
              <Form.PlainInput
                {...formState.emailAddress.props}
                isRequired={fields.emailAddress?.required}
                isOptional={!fields.emailAddress?.required}
                isDisabled={fields.emailAddress?.disabled}
                actionLabel={canToggleEmailPhone ? localizationKeys('signUp.start.actionLink__use_phone') : undefined}
                onActionClicked={canToggleEmailPhone ? onUsePhone : undefined}
              />
            </Form.ControlRow>
          )}
          {visible.phoneNumber && (
            <Form.ControlRow elementId='phoneNumber'>
              <Form.PhoneInput
                {...formState.phoneNumber.props}
                isRequired={fields.phoneNumber?.required}
                isOptional={!fields.phoneNumber?.required}
                actionLabel={canToggleEmailPhone ? localizationKeys('signUp.start.actionLink__use_email') : undefined}
                onActionClicked={canToggleEmailPhone ? onUseEmail : undefined}
              />
            </Form.ControlRow>
          )}
          {visible.password && (
            <Form.ControlRow elementId='password'>
              <Form.PasswordInput
                {...formState.password.props}
                isRequired={fields.password?.required}
                isOptional={!fields.password?.required}
                autoComplete='new-password'
              />
            </Form.ControlRow>
          )}
        </Col>
      )}
      <Col center>
        <Col
          gap={6}
          sx={{
            width: '100%',
          }}
        >
          {visible.legalAccepted && (
            <Form.ControlRow elementId='legalAccepted'>
              <LegalCheckbox
                {...formState.legalAccepted.props}
                isRequired={fields.legalAccepted?.required}
              />
            </Form.ControlRow>
          )}
          <Form.SubmitButton
            hasArrow
            localizationKey={localizationKeys('formButtonPrimary')}
          />
        </Col>
      </Col>
    </Form.Root>
  );
};
