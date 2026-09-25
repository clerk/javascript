import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';

export interface UserProfileEditNameControllerOptions {
  firstName?: string;
  lastName?: string;
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
  onSubmit,
}: UserProfileEditNameControllerOptions): UserProfileEditNameController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { firstName, lastName },
    canSubmit: values => values.firstName !== firstName || values.lastName !== lastName,
    onSubmit: async values => {
      await onSubmit(values);
      setIsOpen(false);
    },
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
