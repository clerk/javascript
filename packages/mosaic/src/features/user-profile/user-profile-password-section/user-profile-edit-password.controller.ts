import { useEffect, useRef, useState } from 'react';

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

export type UserProfileEditPasswordSubmitResult = { status: 'saved' } | { status: 'cancelled' };

export interface UserProfileEditPasswordControllerOptions {
  requiresCurrentPassword?: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<UserProfileEditPasswordSubmitResult>;
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
  const m = useMessages('userProfilePasswordSection');
  const [isOpen, setIsOpen] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<FieldFeedback>();
  const submitting = useRef(false);

  const form = useForm({
    initialValues,
    fields: {
      confirmPassword: {
        validate: (value, values) =>
          value !== '' && value !== values.newPassword ? { type: 'error', message: m.errors.mismatch } : undefined,
      },
    },
    canSubmit: values =>
      values.newPassword !== '' &&
      values.confirmPassword === values.newPassword &&
      (!requiresCurrentPassword || values.currentPassword !== ''),
    onSubmit: async values => {
      submitting.current = true;
      try {
        const result = await onSubmit({
          currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
          newPassword: values.newPassword,
          signOutOfOtherSessions: values.signOutOfOtherSessions,
        });
        if (result.status === 'saved') {
          setIsOpen(false);
        }
      } finally {
        submitting.current = false;
      }
    },
  });

  const password = form.values.newPassword;
  useEffect(() => {
    setPasswordFeedback(undefined);
    if (!isOpen || password === '' || !validatePassword) {
      return;
    }

    let active = true;
    void Promise.resolve()
      .then(() => validatePassword(password))
      .then(
        feedback => {
          if (active) {
            setPasswordFeedback(feedback);
          }
        },
        () => {},
      );
    return () => {
      active = false;
    };
  }, [isOpen, password, validatePassword]);

  const onOpenChange = (open: boolean) => {
    if (submitting.current || form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form, passwordFeedback };
}
