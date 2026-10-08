import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type { useSmsAddPhoneController } from './sms-add-phone.controller';

export const SmsAddPhoneView = ({ controller }: { controller: ReturnType<typeof useSmsAddPhoneController> }) => (
  <Card.Content>
    <Header.Root badgeText={localizationKeys('taskSetupMfa.badge')}>
      <Header.Title localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhoneNumber')} />
      <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhone.infoText')} />
    </Header.Root>
    <Card.Alert>{controller.error}</Card.Alert>
    <Form.Root onSubmit={controller.addPhone}>
      <Form.ControlRow elementId={controller.phoneField.id}>
        <Form.PhoneInput
          {...controller.phoneField.props}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </Form.ControlRow>
      <FormButtonContainer
        sx={theme => ({
          flexDirection: 'column',
          gap: theme.space.$4,
        })}
      >
        <Form.SubmitButton
          hasArrow
          isDisabled={!controller.canSubmit}
          localizationKey={localizationKeys('taskSetupMfa.smsCode.addPhone.formButtonPrimary')}
        />
        <Form.ResetButton
          localizationKey={localizationKeys('taskSetupMfa.smsCode.cancel')}
          onClick={controller.onReset}
        />
      </FormButtonContainer>
    </Form.Root>
  </Card.Content>
);
