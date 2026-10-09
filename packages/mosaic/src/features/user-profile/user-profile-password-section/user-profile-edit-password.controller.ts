import { isReverificationHint } from '@clerk/shared/authorization-errors';
import { isReverificationCancelledError } from '@clerk/shared/error';
import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { FormSubmitError, useForm } from '../../../components/form';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { useDebouncedAsync } from '../../../hooks/use-debounced-async';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import type {
  UserProfileEditPasswordValue,
  UserProfileEditPasswordValues,
  UserProfilePasswordPolicy,
} from './user-profile-password-section.types';

const initialValues: UserProfileEditPasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

export interface UserProfileEditPasswordControllerOptions {
  policy: UserProfilePasswordPolicy;
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
  step: 'edit' | 'verify';
}

export function useUserProfileEditPasswordController({
  policy,
  onSubmit,
  validatePassword,
  formatError = error => error,
  reverification,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
  const requiresCurrentPassword = policy.requiresCurrentPassword;
  const validationError = useMessages('errors').generic;
  const m = useMessages('userProfilePasswordSection');
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    initialValues,
    fields: {
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
      reverification?.reset();
      try {
        const result = await onSubmit({
          currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
          newPassword: values.newPassword,
          signOutOfOtherSessions: values.signOutOfOtherSessions,
        });
        if (isReverificationHint(result)) {
          throw new FormSubmitError({ message: m.errors.verificationIncomplete });
        }
      } catch (error) {
        if (isReverificationCancelledError(error)) {
          return;
        }
        throw formatError(error);
      }
      // TODO: Discuss confirming the password was set or updated and other devices were signed out with a success page or toast. https://github.com/clerk/javascript/pull/9930#discussion_r4151641473
      setIsOpen(false);
    },
  });

  const password = form.values.newPassword;
  const passwordLeft = form.fields.newPassword.touched;
  // TODO: Discuss keeping the password hint hidden on open or showing it immediately when the field autofocuses. https://github.com/clerk/javascript/pull/9930#discussion_r4150863181
  const strength = useDebouncedAsync(
    password,
    value => (validatePassword ? validatePassword(value) : Promise.resolve(undefined)),
    { delayMs: DEBOUNCE_MS, enabled: isOpen && (password !== '' || passwordLeft) && validatePassword !== undefined },
  );
  const passwordFeedback: FieldFeedback | undefined = strength.isError
    ? { type: 'error', message: validationError }
    : strength.data;

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

  return { isOpen, onOpenChange, form, passwordFeedback, reverification, step };
}
