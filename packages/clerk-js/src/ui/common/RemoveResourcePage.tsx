import React from 'react';

import { Text } from '../customizables';
import { Form, FormButtons, FormContent, SuccessPage, useCardState, withCardStateProvider } from '../elements';
import { useActionContext } from '../elements/Action/ActionRoot';
import type { LocalizationKey } from '../localization';
import { handleError } from '../utils';
import { useWizard, Wizard } from './Wizard';

type RemovePageProps = {
  title: LocalizationKey;
  breadcrumbTitle?: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  successMessage: LocalizationKey;
  deleteResource: () => Promise<any>;
  Breadcrumbs: React.ComponentType<any> | null;
};

export const RemoveResourcePage = withCardStateProvider((props: RemovePageProps) => {
  const { title, messageLine1, messageLine2, successMessage, deleteResource } = props;
  const wizard = useWizard();
  const card = useCardState();
  const { close } = useActionContext();

  const handleSubmit = async () => {
    try {
      await deleteResource().then(() => wizard.nextStep());
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <FormContent headerTitle={title}>
        <Form.Root onSubmit={handleSubmit}>
          <Text localizationKey={messageLine1} />
          <Text localizationKey={messageLine2} />
          <FormButtons
            variant='primaryDanger'
            onReset={close}
          />
        </Form.Root>
      </FormContent>
      <SuccessPage
        title={title}
        text={successMessage}
      />
    </Wizard>
  );
});
