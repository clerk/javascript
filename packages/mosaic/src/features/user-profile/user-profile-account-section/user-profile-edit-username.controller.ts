import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { UserProfileEditUsernameValue } from './user-profile-edit-username.dialog';

export interface UserProfileEditUsernameControllerOptions {
  username?: string;
  onSubmit: (username: string) => Promise<void>;
}

export interface UserProfileEditUsernameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditUsernameValue>;
}

export function useUserProfileEditUsernameController({
  username = '',
  onSubmit,
}: UserProfileEditUsernameControllerOptions): UserProfileEditUsernameController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { username },
    canSubmit: values => values.username !== username && values.username !== '',
    onSubmit: async values => {
      await onSubmit(values.username);
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
