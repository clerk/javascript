import { localizationKeys, Text } from '../customizables';
import { Form } from '../elements/Form';
import { FormButtons } from '../elements/FormButtons';
import { FormContainer } from '../elements/FormContainer';
import type { RemoveResourceData } from './remove-resource.types';

export const RemoveResourceView = ({ controller }: { controller: RemoveResourceData }) => (
  <FormContainer
    headerTitle={controller.title}
    headerSubtitle={controller.messageLine1}
  >
    <Form.Root onSubmit={controller.handleSubmit}>
      {controller.messageLine2 ? (
        <Text
          colorScheme='secondary'
          localizationKey={controller.messageLine2}
        />
      ) : null}
      <FormButtons
        submitLabel={localizationKeys('userProfile.formButtonPrimary__remove')}
        colorScheme='danger'
        onReset={controller.onReset}
      />
    </Form.Root>
  </FormContainer>
);
