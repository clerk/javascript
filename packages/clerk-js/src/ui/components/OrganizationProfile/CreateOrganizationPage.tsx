import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreClerk, useCoreOrganizations } from '../../contexts';
import { Form, useCardState, withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { handleError, useFormControl } from '../../utils';
import { FormButtons } from '../UserProfile/FormButtons';
import { InviteMembersPage } from './InviteMembersPage';
import { ContentPage } from './OrganizationContentPage';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';

export const CreateOrganizationPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Create Organization';
  const subtitle = 'Set the organization profile';
  const card = useCardState();
  const [file, setFile] = React.useState<File>();
  const { createOrganization } = useCoreOrganizations();
  const { setActive } = useCoreClerk();

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

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmit}>
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value }}
            onAvatarChange={async file => await setFile(file)}
          />
          <Form.ControlRow>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...nameField.props}
              required
            />
          </Form.ControlRow>
          <FormButtons
            // localizationKey={localizationKeys('createOrganization')}
            isDisabled={!canSubmit}
            submitLabel={'Create organization'}
          />
        </Form.Root>
      </ContentPage>
      <InviteMembersPage />
    </Wizard>
  );
});
