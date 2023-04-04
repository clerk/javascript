import { useRef } from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { Flex } from '../../primitives';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const PasswordRemovalPage = withCardStateProvider(() => {
  const user = useCoreUser();
  const title = localizationKeys('userProfile.passwordPage.removePasswordTitle');
  const card = useCardState();
  const wizard = useWizard();

  // Ensure that messages will not use the updated state of User after a password has been set or changed
  const successPagePropsRef = useRef<Parameters<typeof SuccessPage>[0]>({
    title: localizationKeys('userProfile.passwordPage.title'),
  });

  const currentPasswordField = useFormControl('currentPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__currentPassword'),
    isRequired: true,
  });

  const canSubmit = !!currentPasswordField.value;

  const validateForm = () => {
    currentPasswordField.setError(undefined);
  };

  const navigateToConfirmationStep = () => {
    wizard.nextStep();
  };

  const removePassword = async () => {
    try {
      successPagePropsRef.current = {
        title: user.passwordEnabled
          ? localizationKeys('userProfile.passwordPage.changePasswordTitle')
          : localizationKeys('userProfile.passwordPage.title'),
        text: localizationKeys('userProfile.passwordPage.successMessage'),
        Breadcrumbs: UserProfileBreadcrumbs,
      };

      await user.removePassword({
        currentPassword: currentPasswordField.value,
      });
      wizard.nextStep();
    } catch (e) {
      handleError(e, [currentPasswordField], card.setError);
      wizard.prevStep();
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        <Form.Root
          onSubmit={navigateToConfirmationStep}
          onBlur={validateForm}
        >
          <Form.ControlRow elementId={currentPasswordField.id}>
            <Form.Control
              {...currentPasswordField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>

      <ContentPage
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        <Flex
          direction={'col'}
          gap={4}
        >
          <Text
            localizationKey={'Your password will be removed from this account.'}
            variant='regularRegular'
          />
          <Text
            localizationKey={
              'Signing in and other actions that require authentication must rely upon other methods if no password is set.'
            }
            variant='regularRegular'
          />
        </Flex>
        <Form.Root
          onSubmit={removePassword}
          onBlur={validateForm}
        >
          <FormButtons
            colorScheme={'danger'}
            isDisabled={!canSubmit}
            onReset={wizard.prevStep}
          />
        </Form.Root>
      </ContentPage>

      <SuccessPage
        title={title}
        text={localizationKeys('userProfile.passwordPage.removePasswordSuccessMessage')}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});
