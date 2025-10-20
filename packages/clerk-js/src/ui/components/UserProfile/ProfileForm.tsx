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

  if (!user) {
    return null;
  }

  const {
    imageChanged,
    resourceForPreview: userForPreview,
    handleImageChange,
    handleImageRemove,
    handleReset,
    saveImage,
    pendingFile,
  } = useDeferredImageUpload({
    resource: user,
    onReset,
  });

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
  const optionalFieldsChanged = userInfoChanged || imageChanged;

  const hasRequiredFields = (showFirstName && first_name.required) || (showLastName && last_name.required);
  const requiredFieldsFilled =
    hasRequiredFields && !!lastNameField.value && !!firstNameField.value && optionalFieldsChanged;

  const nameEditDisabled = user.enterpriseAccounts.some(ea => ea.active);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save avatar if changed
      await saveImage(file => user.setProfileImage({ file }));

      // Save name changes if changed
      if (userInfoChanged) {
        await user.update({ firstName: firstNameField.value, lastName: lastNameField.value });
      }

      onSuccess();
    } catch (err) {
      handleError(err, [firstNameField, lastNameField], card.setError);
    }
  };

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.profilePage.title')}>
      {nameEditDisabled && <InformationBox message={localizationKeys('userProfile.profilePage.readonly')} />}

      <Form.Root
        onSubmit={onSubmit}
        sx={t => ({ gap: t.space.$6 })}
      >
        <UserProfileAvatarUploader
          user={userForPreview}
          onAvatarChange={handleImageChange}
          onAvatarRemove={isDefaultImage(user.imageUrl) && !pendingFile ? null : handleImageRemove}
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
