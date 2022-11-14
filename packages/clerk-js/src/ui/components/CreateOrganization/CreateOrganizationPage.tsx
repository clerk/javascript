import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreClerk, useCoreOrganization, useCoreOrganizations, useCreateOrganizationContext } from '../../contexts';
import {
  ContentPage,
  Form,
  FormButtonContainer,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { localizationKeys } from '../../localization';
import { handleError, useFormControl } from '../../utils';
import { InviteMembersForm } from '../OrganizationProfile/InviteMembersForm';
import { InvitationsSentMessage } from '../OrganizationProfile/InviteMembersPage';
import { OrganizationProfileAvatarUploader } from '../OrganizationProfile/OrganizationProfileAvatarUploader';

export const CreateOrganizationPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Create Organization';
  const subtitle = 'Set the organization profile';
  const card = useCardState();
  const [file, setFile] = React.useState<File | null>();
  const { createOrganization } = useCoreOrganizations();
  const { setActive, closeCreateOrganization } = useCoreClerk();
  const { mode, navigateAfterCreateOrganization } = useCreateOrganizationContext();
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });

  const dataChanged = !!nameField.value;
  const canSubmit = dataChanged || !!file;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    return createOrganization?.({ name: nameField.value })
      .then(org => (file ? org.setLogo({ file }) : org))
      .then(org => setActive({ organization: org }))
      .then(wizard.nextStep)
      .catch(err => handleError(err, [nameField], card.setError));
  };

  const completeFlow = () => {
    navigateAfterCreateOrganization();
    if (mode === 'modal') {
      closeCreateOrganization();
    }
  };

  const onAvatarRemove = () => {
    card.setIdle();
    return setFile(null);
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        headerSubtitle={subtitle}
        sx={t => ({ minHeight: t.sizes.$60 })}
      >
        <Form.Root onSubmit={onSubmit}>
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value }}
            onAvatarChange={async file => await setFile(file)}
            onAvatarRemove={file ? onAvatarRemove : null}
          />
          <Form.ControlRow>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...nameField.props}
              required
            />
          </Form.ControlRow>
          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              isDisabled={!canSubmit}
              localizationKey={'Create organization'}
            />
            {mode === 'modal' && (
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={closeCreateOrganization}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </ContentPage>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <InviteMembersForm
          organization={organization!}
          resetButtonLabel={'Skip'}
          onSuccess={wizard.nextStep}
          onReset={completeFlow}
        />
      </ContentPage>
      <SuccessPage
        title={title}
        content={<InvitationsSentMessage />}
        onFinish={completeFlow}
      />
    </Wizard>
  );
});
