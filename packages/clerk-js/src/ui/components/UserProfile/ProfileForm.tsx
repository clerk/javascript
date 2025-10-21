import { useUser } from '@clerk/shared/react';
import React from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { InformationBox } from '@/ui/elements/InformationBox';
import { handleError } from '@/ui/utils/errorHandler';
import { useDeferredImageUpload } from '@/ui/utils/useDeferredImageUpload';
import { useFormControl } from '@/ui/utils/useFormControl';

import { isDefaultImage } from '../../../utils';
import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { UserProfileAvatarUploader } from './UserProfileAvatarUploader';

type ProfileFormProps = FormProps;

export const ProfileForm = withCardStateProvider((props: ProfileFormProps) => {
  const { onSuccess, onReset } = props;
  const card = useCardState();
  const { user } = useUser();
  const imageUpload = useDeferredImageUpload(!isDefaultImage(user?.imageUrl || ''));

  if (!user) {
    return null;
  }

  const { first_name, last_name } = useEnvironment().userSettings.attributes;
  const showFirstName = first_name?.enabled;
  const showLastName = last_name?.enabled;
  const userFirstName = user.firstName || '';
  const userLastName = user.lastName || '';

  const firstNameField = useFormControl('firstName', user.firstName || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__firstName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    isRequired: last_name?.required,
  });
  const lastNameField = useFormControl('lastName', user.lastName || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__lastName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    isRequired: last_name?.required,
  });

  const userInfoChanged =
    (showFirstName && firstNameField.value !== userFirstName) || (showLastName && lastNameField.value !== userLastName);
  const optionalFieldsChanged = userInfoChanged || imageUpload.hasImageChanges;

  const hasRequiredFields = (showFirstName && first_name.required) || (showLastName && last_name.required);
  const requiredFieldsFilled =
    hasRequiredFields && !!lastNameField.value && !!firstNameField.value && optionalFieldsChanged;

  const nameEditDisabled = user.enterpriseAccounts.some(ea => ea.active);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First handle image upload if there are changes
      if (imageUpload.hasImageChanges) {
        await imageUpload.uploadImage(async file => {
          await user.setProfileImage({ file });
        });
      }

      // Then handle user info changes
      if (userInfoChanged) {
        await user.update({ firstName: firstNameField.value, lastName: lastNameField.value });
      }

      onSuccess?.();
    } catch (err) {
      handleError(err, [firstNameField, lastNameField], card.setError);
    }
  };

  const handleReset = () => {
    imageUpload.handleReset();
    firstNameField.setValue(userFirstName);
    lastNameField.setValue(userLastName);
    onReset?.();
  };

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.profilePage.title')}>
      {nameEditDisabled && <InformationBox message={localizationKeys('userProfile.profilePage.readonly')} />}

      <Form.Root
        onSubmit={onSubmit}
        sx={t => ({ gap: t.space.$6 })}
      >
        <UserProfileAvatarUploader
          user={user}
          onAvatarChange={imageUpload.handleImageChange}
          onAvatarRemove={imageUpload.shouldShowRemoveButton ? imageUpload.handleImageRemove : null}
          previewImageUrl={imageUpload.previewUrl}
          imageRemoved={imageUpload.imageRemoved}
        />
        {(showFirstName || showLastName) && (
          <Form.ControlRow elementId='name'>
            {showFirstName && (
              <Form.PlainInput
                {...firstNameField.props}
                isDisabled={nameEditDisabled}
                autoFocus
              />
            )}
            {showLastName && (
              <Form.PlainInput
                {...lastNameField.props}
                isDisabled={nameEditDisabled}
                autoFocus={!showFirstName}
              />
            )}
          </Form.ControlRow>
        )}

        <FormButtons
          isDisabled={hasRequiredFields ? !requiredFieldsFilled : !optionalFieldsChanged}
          onReset={handleReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
