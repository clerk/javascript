import { Text } from '../customizables';
import type { FormProps } from '../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../elements';
import type { LocalizationKey } from '../localization';
import { handleError } from '../utils';

type RemoveFormProps = FormProps & {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  successMessage?: LocalizationKey;
  deleteResource: () => Promise<any>;
};

export const RemoveResourceForm = withCardStateProvider((props: RemoveFormProps) => {
  const { title, messageLine1, messageLine2, deleteResource, onSuccess, onReset } = props;
  const card = useCardState();

  const handleSubmit = async () => {
    try {
      await deleteResource().then(onSuccess);
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <FormContainer
      headerTitle={title}
      headerSubtitle={messageLine1}
    >
      <Form.Root onSubmit={handleSubmit}>
        <Text
          colorScheme='neutral'
          localizationKey={messageLine2}
        />
        <FormButtons
          colorScheme='danger'
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
