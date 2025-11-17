import { useOrganization } from '@clerk/shared/react';
import type { UpdateOrganizationParams } from '@clerk/shared/types';
import React from 'react';

import { useEnvironment } from '@/ui/contexts';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { isDefaultImage } from '../../../utils';
import { localizationKeys } from '../../customizables';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';

type ProfileFormProps = FormProps;

export const ProfileForm = withCardStateProvider((props: ProfileFormProps) => {
  const { onSuccess, onReset } = props;
  const title = localizationKeys('organizationProfile.profilePage.title');
  const card = useCardState();
  const { organization } = useOrganization();
  const { organizationSettings } = useEnvironment();

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
  const canSubmit = dataChanged && slugField.feedbackType !== 'error';
  const organizationSlugEnabled = !organizationSettings.slug.disabled;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateOrgParams: UpdateOrganizationParams = { name: nameField.value };

    if (organizationSlugEnabled) {
      updateOrgParams.slug = slugField.value;
    }

    return (canSubmit ? organization.update(updateOrgParams) : Promise.resolve()).then(onSuccess).catch(err => {
      handleError(err, [nameField, slugField], card.setError);
    });
  };

  const uploadAvatar = (file: File) => {
    return organization
      .setLogo({ file })
      .then(() => {
        card.setIdle();
        onSuccess?.();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const onAvatarRemove = () => {
    void organization
      .setLogo({ file: null })
      .then(() => {
        card.setIdle();
        onSuccess?.();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const onChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSlugField(event.target.value);
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
    slugField.clearFeedback();
  };

  return (
    <FormContainer headerTitle={title}>
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
            ignorePasswordManager
          />
        </Form.ControlRow>
        {organizationSlugEnabled && (
          <Form.ControlRow elementId={slugField.id}>
            <Form.PlainInput
              {...slugField.props}
              onChange={onChangeSlug}
              ignorePasswordManager
            />
          </Form.ControlRow>
        )}
        <FormButtons
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
