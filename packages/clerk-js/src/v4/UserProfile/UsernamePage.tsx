import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { useWizard, Wizard } from '../common';
import { Form, useCardState, withCardStateProvider } from '../elements';
import { handleError, useFormControl } from '../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const UsernamePage = withCardStateProvider(() => {
  const user = useCoreUser();
  const card = useCardState();
  const wizard = useWizard();
  const { navigate } = useNavigate();
  const usernameField = useFormControl('username', user.username || '', { type: 'text', label: 'Username' });

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
      <ContentPage.Root headerTitle='Update username'>
        <Form.Root onSubmit={updatePassword}>
          <Form.ControlRow>
            <Form.Control
              {...usernameField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <ContentPage.Toolbar>
            <FormButtons
              isDisabled={!canSubmit}
              onCancel={() => navigate('../')}
            />
          </ContentPage.Toolbar>
        </Form.Root>
      </ContentPage.Root>
      <SuccessPage
        title={'Update username'}
        text={'Your username has been updated.'}
      />
    </Wizard>
  );
});
