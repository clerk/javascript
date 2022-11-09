import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from '../UserProfile/UserProfileNavbar';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const ProfileSettingsPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Organization profile';
  const subtitle = 'Manage organization profile';
  const card = useCardState();
  const [avatarChanged, setAvatarChanged] = React.useState(false);
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const nameField = useFormControl('name', organization?.name || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });

  if (!organization) {
    return null;
  }

  const dataChanged = organization.name !== nameField.value;
  const canSubmit = dataChanged || avatarChanged;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return (dataChanged ? organization.update({ name: nameField.value }) : Promise.resolve())
      .then(wizard.nextStep)
      .catch(err => {
        handleError(err, [nameField], card.setError);
      });
  };

  const uploadAvatar = (file: File | null) => {
    return organization.setLogo({ file }).then(() => {
      setAvatarChanged(true);
      card.setIdle();
    });
  };

  const onAvatarRemove = () => {
    void organization.setLogo({ file: null }).then(() => {
      setAvatarChanged(true);
      card.setIdle();
    });
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        headerSubtitle={subtitle}
        Breadcrumbs={OrganizationProfileBreadcrumbs}
      >
        <Form.Root onSubmit={onSubmit}>
          <OrganizationProfileAvatarUploader
            organization={organization}
            onAvatarChange={uploadAvatar}
            onAvatarRemove={onAvatarRemove}
            hasDefaultImage={!organization.logoUrl}
          />
          <Form.ControlRow>
            <Form.Control
              {...nameField.props}
              required
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={title}
        text={localizationKeys('organizationProfile.profilePage.successMessage')}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});
