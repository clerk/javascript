import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import { useEffect, useState } from 'react';

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
  passwordFeedback: FieldFeedback | undefined;
}

export function useUserProfileEditPasswordController({
  requiresCurrentPassword = false,
  onSubmit,
  validatePassword,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
  const validationError = useMessages('errors').generic;
  const m = useMessages('userProfilePasswordSection');
  const [isOpen, setIsOpen] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<FieldFeedback>();

  const form = useForm({
    initialValues,
    fields: {
      confirmPassword: {
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
      setIsOpen(false);
    },
  });

  const password = form.values.newPassword;
  const passwordLeft = form.fields.newPassword.touched;
  useEffect(() => {
    if (!isOpen || (password === '' && !passwordLeft) || !validatePassword) {
      setPasswordFeedback(undefined);
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      void Promise.resolve()
        .then(() => validatePassword(password))
        .then(
          feedback => {
            if (active) {
              setPasswordFeedback(feedback);
            }
          },
          () => {
            if (active) {
              setPasswordFeedback({ type: 'error', message: validationError });
            }
          },
        );
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [isOpen, password, passwordLeft, validatePassword, validationError]);

  const onOpenChange = (open: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form, passwordFeedback };
}
