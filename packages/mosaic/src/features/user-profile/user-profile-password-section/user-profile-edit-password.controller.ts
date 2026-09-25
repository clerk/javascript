import { isReverificationHint } from '@clerk/shared/authorization-errors';
import { isReverificationCancelledError } from '@clerk/shared/error';
import { useEffect, useRef, useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
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
  formatError?: (error: unknown) => unknown;
  reverification?: ReverificationController;
}

export interface UserProfileEditPasswordController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditPasswordValues>;
  passwordFeedback: FieldFeedback | undefined;
  reverification?: ReverificationController;
}

export function useUserProfileEditPasswordController({
  requiresCurrentPassword = false,
  onSubmit,
  validatePassword,
  formatError = error => error,
  reverification,
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
          value !== values.newPassword ? { type: 'error', message: m.errors.mismatch } : undefined,
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
        if (isReverificationHint(result)) {
          throw new Error(m.errors.verificationIncomplete);
        }
        setIsOpen(false);
      } catch (error) {
        if (isReverificationCancelledError(error)) {
          return;
        }
        throw formatError(error);
      } finally {
        submitting.current = false;
      }
    },
  });

  const password = form.values.newPassword;
  const passwordLeft = form.fields.newPassword.touched;
  useEffect(() => {
    setPasswordFeedback(undefined);
    if (!isOpen || (password === '' && !passwordLeft) || !validatePassword) {
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
  }, [isOpen, password, passwordLeft, validatePassword]);

  const onOpenChange = (open: boolean) => {
    if (!open && reverification && reverification.status !== 'idle') {
      reverification.onCancel?.();
      return;
    }
    if (submitting.current || form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form, passwordFeedback, reverification };
}
