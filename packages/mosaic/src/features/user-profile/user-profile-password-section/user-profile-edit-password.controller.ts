import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
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
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<unknown>;
  validatePassword?: (password: string) => Promise<FieldFeedback | undefined>;
}

export interface UserProfileEditPasswordController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditPasswordValues>;
}

export function useUserProfileEditPasswordController({
  requiresCurrentPassword = false,
  onSubmit,
  validatePassword,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
  const m = useMessages('userProfilePasswordSection');
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    initialValues,
    fields: {
      newPassword: validatePassword && {
        validateAsync: password => validatePassword(password),
        debounceMs: DEBOUNCE_MS,
      },
      confirmPassword: {
        // TODO: Discuss showing success feedback when the confirmation matches, as legacy does. https://github.com/clerk/javascript/pull/9930#discussion_r4150406791
        validate: (value, values) =>
          value !== values.newPassword ? { type: 'error', message: m.errors.mismatch } : undefined,
      },
    },
    canSubmit: values =>
      values.newPassword !== '' &&
      values.confirmPassword === values.newPassword &&
      (!requiresCurrentPassword || values.currentPassword !== ''),
    onSubmit: async values => {
      await onSubmit({
        currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
        signOutOfOtherSessions: values.signOutOfOtherSessions,
      });
      // TODO: Discuss confirming the password was set or updated and other devices were signed out with a success page or toast. https://github.com/clerk/javascript/pull/9930#discussion_r4151641473
      setIsOpen(false);
    },
  });

  const onOpenChange = (open: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form };
}
