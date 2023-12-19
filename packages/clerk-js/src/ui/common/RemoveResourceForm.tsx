import React from 'react';

import { Text } from '../customizables';
import type { FormProps } from '../elements';
import { Form, FormButtons, FormContent, useCardState, withCardStateProvider } from '../elements';
import type { LocalizationKey } from '../localization';
import { handleError } from '../utils';

type RemoveFormProps = FormProps & {
  title: LocalizationKey;
  breadcrumbTitle?: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  successMessage?: LocalizationKey;
  deleteResource: () => Promise<any>;
  Breadcrumbs?: React.ComponentType<any> | null;
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
    <FormContent headerTitle={title}>
      <Form.Root onSubmit={handleSubmit}>
        <Text localizationKey={messageLine1} />
        <Text localizationKey={messageLine2} />
        <FormButtons
          variant='primaryDanger'
          onReset={onReset}
        />
      </Form.Root>
    </FormContent>
  );
});
