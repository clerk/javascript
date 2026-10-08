import { Col, localizationKeys, Text } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { useDeleteUserController } from './delete-user.controller';

export const DeleteUserView = ({ controller }: { controller: ReturnType<typeof useDeleteUserController> }) => (
  <FormContainer
    headerTitle={localizationKeys('userProfile.deletePage.title')}
    sx={t => ({ gap: t.space.$0x5 })}
  >
    <Form.Root onSubmit={controller.deleteUser}>
      <Col gap={1}>
        <Text
          colorScheme='secondary'
          localizationKey={localizationKeys('userProfile.deletePage.messageLine1')}
        />
        <Text
          colorScheme='danger'
          localizationKey={localizationKeys('userProfile.deletePage.messageLine2')}
        />
      </Col>

      <Form.ControlRow elementId={controller.confirmationField.id}>
        <Form.PlainInput
          {...controller.confirmationField.props}
          ignorePasswordManager
        />
      </Form.ControlRow>
      <FormButtons
        submitLabel={localizationKeys('userProfile.deletePage.confirm')}
        colorScheme='danger'
        isDisabled={!controller.canSubmit}
        onReset={controller.onReset}
      />
    </Form.Root>
  </FormContainer>
);
