import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';

export interface UserProfileEditNameControllerOptions {
  firstName?: string;
  lastName?: string;
  firstNameRequired?: boolean;
  lastNameRequired?: boolean;
  /** Resolve to close the dialog, or reject with a `SaveError` to keep it open showing why. */
  onSubmit: (value: UserProfileEditNameValue) => Promise<void>;
}

export interface UserProfileEditNameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditNameValue>;
}

export function useUserProfileEditNameController({
  firstName = '',
  lastName = '',
  firstNameRequired = false,
  lastNameRequired = false,
  onSubmit,
}: UserProfileEditNameControllerOptions): UserProfileEditNameController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { firstName, lastName },
    canSubmit: values =>
      (values.firstName !== firstName || values.lastName !== lastName) &&
      (!firstNameRequired || values.firstName !== '') &&
      (!lastNameRequired || values.lastName !== ''),
    onSubmit: values => onSubmit(values),
    onSuccess: () => setIsOpen(false),
  });

  const onOpenChange = (open: boolean) => {
    if (!open && form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form };
}
