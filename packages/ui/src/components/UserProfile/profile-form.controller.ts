import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { ProfileFormReadyData, ProfileFormViewProps } from './profile-form.types';

export const useProfileFormController = (model: ProfileFormReadyData): ProfileFormViewProps => {
  const card = useCardState();
  const firstNameField = useFormControl('firstName', model.firstName, {
    type: 'text',
    label: localizationKeys('formFieldLabel__firstName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
    isRequired: model.lastNameRequired,
  });
  const lastNameField = useFormControl('lastName', model.lastName, {
    type: 'text',
    label: localizationKeys('formFieldLabel__lastName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
    isRequired: model.lastNameRequired,
  });

  const userInfoChanged =
    (model.showFirstName && firstNameField.value !== model.firstName) ||
    (model.showLastName && lastNameField.value !== model.lastName);
  const hasRequiredFields =
    (model.showFirstName && model.firstNameRequired) || (model.showLastName && model.lastNameRequired);
  const requiredFieldsFilled = hasRequiredFields && !!lastNameField.value && !!firstNameField.value && userInfoChanged;

  const mounted = useRef(true);
  const pendingSave = useRef<Promise<void>>();
  const latest = useRef({ card, firstNameField, lastNameField });
  latest.current = { card, firstNameField, lastNameField };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingSave.current = undefined;
    };
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!mounted.current) {
      return Promise.resolve();
    }
    if (pendingSave.current) {
      return pendingSave.current;
    }
    const ownsRequest = () => mounted.current && pendingSave.current === request;
    const request = (async () => {
      if (userInfoChanged) {
        await model.updateName(firstNameField.value, lastNameField.value);
      } else {
        await model.complete();
      }
    })()
      .catch(error => {
        if (ownsRequest()) {
          const { card, firstNameField, lastNameField } = latest.current;
          handleError(error, [firstNameField, lastNameField], card.setError);
        }
      })
      .finally(() => {
        if (ownsRequest()) {
          pendingSave.current = undefined;
        }
      });
    pendingSave.current = request;
    return request;
  };

  const changeAvatar = (file: File | null) =>
    model.setProfileImage(file).catch(error => {
      if (mounted.current) {
        handleError(error, [], latest.current.card.setError);
      }
    });

  return {
    firstNameField: { id: firstNameField.id, props: firstNameField.props },
    lastNameField: { id: lastNameField.id, props: lastNameField.props },
    avatar: { firstName: model.firstName, lastName: model.lastName, imageUrl: model.imageUrl },
    showFirstName: model.showFirstName,
    showLastName: model.showLastName,
    nameEditDisabled: model.nameEditDisabled,
    canRemoveAvatar: model.canRemoveAvatar,
    isSubmitDisabled: hasRequiredFields ? !requiredFieldsFilled : !userInfoChanged,
    onSubmit,
    uploadAvatar: file => changeAvatar(file),
    onAvatarRemove: () => changeAvatar(null),
    onReset: model.onReset,
  };
};
