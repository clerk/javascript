import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import { useMessages } from '../../../localization';
import type {
  UserProfileEditPasswordValue,
  UserProfileEditPasswordValues,
} from './user-profile-password-section.types';

const initialValues: UserProfileEditPasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

export interface UserProfileEditPasswordControllerOptions {
  requiresCurrentPassword?: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<void>;
}

export interface UserProfileEditPasswordController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditPasswordValues>;
}

export function useUserProfileEditPasswordController({
  requiresCurrentPassword = false,
  onSubmit,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
  const m = useMessages('userProfilePasswordSection');
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    initialValues,
    fields: {
      confirmPassword: {
        validate: (value, values) =>
          value !== '' && value !== values.newPassword ? { type: 'error', message: m.errors.mismatch } : undefined,
      },
    },
    canSubmit: values => values.newPassword !== '' && (!requiresCurrentPassword || values.currentPassword !== ''),
    onSubmit: async values => {
      await onSubmit({
        currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
        signOutOfOtherSessions: values.signOutOfOtherSessions,
      });
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
