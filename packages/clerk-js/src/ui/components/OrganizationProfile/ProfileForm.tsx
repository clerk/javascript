import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { isDefaultImage } from '../../../utils';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContent, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';

type ProfileFormProps = FormProps;

export const ProfileForm = withCardStateProvider((props: ProfileFormProps) => {
  const { onSuccess, onReset } = props;
  const title = localizationKeys('organizationProfile.profilePage.title');
  const subtitle = localizationKeys('organizationProfile.profilePage.subtitle');
  const card = useCardState();
  const [avatarChanged, setAvatarChanged] = React.useState(false);
  const { organization } = useOrganization();

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
  const canSubmit = (dataChanged || avatarChanged) && slugField.feedbackType !== 'error';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return (dataChanged ? organization.update({ name: nameField.value, slug: slugField.value }) : Promise.resolve())
      .then(onSuccess)
      .catch(err => {
        handleError(err, [nameField, slugField], card.setError);
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
    updateSlugField(event.target.value);
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
    slugField.setError(undefined);
  };

  return (
    <FormContent
      headerTitle={title}
      headerSubtitle={subtitle}
    >
      <Form.Root onSubmit={onSubmit}>
        <OrganizationProfileAvatarUploader
          organization={organization}
          onAvatarChange={uploadAvatar}
          onAvatarRemove={isDefaultImage(organization.imageUrl) ? null : onAvatarRemove}
        />
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput
            {...nameField.props}
            autoFocus
            isRequired
          />
        </Form.ControlRow>
        <Form.ControlRow elementId={slugField.id}>
          <Form.PlainInput
            {...slugField.props}
            onChange={onChangeSlug}
          />
        </Form.ControlRow>
        <FormButtons
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContent>
  );
});
