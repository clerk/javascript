import React from 'react';

import { createSlug, isValidSlug } from '../../../ui/utils';
import { useWizard, Wizard } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from '../UserProfile/UserProfileNavbar';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const ProfileSettingsPage = withCardStateProvider(() => {
  const title = localizationKeys('organizationProfile.profilePage.title');
  const subtitle = localizationKeys('organizationProfile.profilePage.subtitle');
  const card = useCardState();
  const { t } = useLocalizations();
  const [avatarChanged, setAvatarChanged] = React.useState(false);
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const nameField = useFormControl('name', organization?.name || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });

  const slugField = useFormControl('slug', organization?.slug || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationSlug'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationSlug'),
  });

  if (!organization) {
    return null;
  }

  const dataChanged = organization.name !== nameField.value || organization.slug !== slugField.value;
  const canSubmit = (dataChanged || avatarChanged) && !slugField.errorText;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return (dataChanged ? organization.update({ name: nameField.value, slug: slugField.value }) : Promise.resolve())
      .then(wizard.nextStep)
      .catch(err => {
        handleError(err, [nameField], card.setError);
      });
  };

  const uploadAvatar = (file: File) => {
    return organization
      .setLogo({ file })
      .then(() => {
        setAvatarChanged(true);
        card.setIdle();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const onAvatarRemove = () => {
    void organization
      .setLogo({ file: null })
      .then(() => {
        setAvatarChanged(true);
        card.setIdle();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const onChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && !isValidSlug(event.target.value)) {
      updateSlugField(event.target.value, t(localizationKeys('formFieldErrorText__organizationSlug')));
      return;
    }

    updateSlugField(event.target.value);
  };

  const updateSlugField = (val: string, errorMessage?: string | undefined) => {
    slugField.setValue(val);
    slugField.setError(errorMessage as string);
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
            onAvatarRemove={organization.logoUrl ? onAvatarRemove : null}
          />
          <Form.ControlRow elementId={nameField.id}>
            <Form.Control
              {...nameField.props}
              autoFocus
              required
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={slugField.id}>
            <Form.Control
              {...slugField.props}
              onChange={onChangeSlug}
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
