import React from 'react';

import { useWizard, Wizard } from '../common';
import { useCoreUser } from '../contexts';
import { localizationKeys } from '../customizables';
import { Form, useCardState, withCardStateProvider } from '../elements';
import { handleError, useFormControl } from '../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const UsernamePage = withCardStateProvider(() => {
  const user = useCoreUser();
  const card = useCardState();
  const wizard = useWizard();
  const usernameField = useFormControl('username', user.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
  });

  const canSubmit = usernameField.value.length > 1 && user.username !== usernameField.value;

  const updatePassword = async () => {
    try {
      await user.update({ username: usernameField.value });
      wizard.nextStep();
    } catch (e) {
      handleError(e, [usernameField], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={localizationKeys('userProfile.usernamePage.title')}>
        <Form.Root onSubmit={updatePassword}>
          <Form.ControlRow>
            <Form.Control
              {...usernameField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage.Root>
      <SuccessPage
        title={localizationKeys('userProfile.usernamePage.title')}
        text={localizationKeys('userProfile.usernamePage.successMessage')}
      />
    </Wizard>
  );
});
