import React from 'react';

import { Text } from '../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../elements';
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
  const { title, messageLine1, messageLine2, breadcrumbTitle, successMessage, deleteResource } = props;
  const wizard = useWizard();
  const card = useCardState();

  const handleSubmit = async () => {
    try {
      await deleteResource().then(() => wizard.nextStep());
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        breadcrumbTitle={breadcrumbTitle}
        Breadcrumbs={props.Breadcrumbs}
      >
        <Form.Root onSubmit={handleSubmit}>
          <Text
            localizationKey={messageLine1}
            variant='regularRegular'
          />
          <Text
            localizationKey={messageLine2}
            variant='regularRegular'
          />
          <FormButtons colorScheme={'danger'} />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        text={successMessage}
        Breadcrumbs={props.Breadcrumbs}
      />
    </Wizard>
  );
});
