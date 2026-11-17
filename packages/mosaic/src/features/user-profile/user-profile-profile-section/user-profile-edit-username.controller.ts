import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { ReverificationController } from '../../reverification';
import type { UserProfileEditUsernameValue } from './user-profile-edit-username.dialog';

export interface UserProfileEditUsernameControllerOptions {
  username?: string;
  required?: boolean;
  onSubmit: (username: string) => Promise<void>;
  reverification?: ReverificationController;
}

export interface UserProfileEditUsernameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditUsernameValue>;
  step: 'edit' | 'verify';
}

export function useUserProfileEditUsernameController({
  username = '',
  required = false,
  onSubmit,
  reverification,
}: UserProfileEditUsernameControllerOptions): UserProfileEditUsernameController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { username },
    canSubmit: values => values.username !== username && (!required || values.username !== ''),
    onSubmit: values => onSubmit(values.username),
    onSuccess: () => setIsOpen(false),
  });

  const step = form.isSubmitting && reverification?.visible ? 'verify' : 'edit';

  const onOpenChange = (open: boolean) => {
    if (form.isSubmitting) {
      if (open || !reverification?.onCancel) {
        return;
      }
      reverification.onCancel();
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form, step };
}
