import { useReverification } from '@clerk/shared/react';

import { localizationKeys, Text } from '../customizables';
import type { FormProps } from '../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../elements';
import type { LocalizationKey } from '../localization';
import { handleError } from '../utils';

type RemoveFormProps = FormProps & {
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2?: LocalizationKey;
  successMessage?: LocalizationKey;
  deleteResource: () => Promise<any>;
};

export const RemoveResourceForm = withCardStateProvider((props: RemoveFormProps) => {
  const { title, messageLine1, messageLine2, deleteResource, onSuccess, onReset } = props;
  const card = useCardState();
  const { action: deleteWithReverification } = useReverification(deleteResource);

  const handleSubmit = async () => {
    try {
      await deleteWithReverification().then(onSuccess);
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
        {messageLine2 ? (
          <Text
            colorScheme='secondary'
            localizationKey={messageLine2}
          />
        ) : null}
        <FormButtons
          submitLabel={localizationKeys('userProfile.formButtonPrimary__remove')}
          colorScheme='danger'
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
