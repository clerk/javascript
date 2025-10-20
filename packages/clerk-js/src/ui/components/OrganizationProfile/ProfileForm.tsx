import { useOrganization } from '@clerk/shared/react';
import type { UpdateOrganizationParams } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '@/ui/contexts';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { useDeferredImageUpload } from '@/ui/utils/useDeferredImageUpload';
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

  const {
    imageChanged,
    resourceForPreview: organizationForPreview,
    handleImageChange,
    handleImageRemove,
    handleReset,
    saveImage,
    pendingFile,
  } = useDeferredImageUpload({
    resource: organization,
    onReset,
  });

  const dataChanged = organization.name !== nameField.value || organization.slug !== slugField.value || imageChanged;
  const canSubmit = dataChanged && slugField.feedbackType !== 'error';
  const organizationSlugEnabled = !organizationSettings.slug.disabled;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await card
      .runAsync(async () => {
        await saveImage(file => organization.setLogo({ file }));
        if (organization.name !== nameField.value || organization.slug !== slugField.value) {
          const updateOrgParams: UpdateOrganizationParams = { name: nameField.value };
          if (organizationSlugEnabled) {
            updateOrgParams.slug = slugField.value;
          }
          await organization.update(updateOrgParams);
        }
      })
      .then(onSuccess)
      .catch(err => handleError(err, [nameField, slugField], card.setError));
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
          organization={organizationForPreview}
          onAvatarChange={handleImageChange}
          onAvatarRemove={isDefaultImage(organization.imageUrl) && !pendingFile ? null : handleImageRemove}
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
          onReset={handleReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
