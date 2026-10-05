import { DEBOUNCE_MS } from '@clerk/shared/internal/clerk-js/constants';
import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { useDebouncedAsync } from '../../../hooks/use-debounced-async';
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
  hasPassword?: boolean;
  identifier?: string;
  requiresCurrentPassword?: boolean;
  onSubmit: (value: UserProfileEditPasswordValue) => Promise<unknown>;
  validatePassword?: (password: string) => Promise<FieldFeedback | undefined>;
}

export interface UserProfileEditPasswordController {
  hasPassword: boolean;
  identifier: string;
  requiresCurrentPassword: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileEditPasswordValues>;
  passwordFeedback: FieldFeedback | undefined;
}

export function useUserProfileEditPasswordController({
  hasPassword = false,
  identifier = '',
  requiresCurrentPassword = false,
  onSubmit,
  validatePassword,
}: UserProfileEditPasswordControllerOptions): UserProfileEditPasswordController {
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
      await onSubmit({
        currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
        signOutOfOtherSessions: values.signOutOfOtherSessions,
      });
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

  const onOpenChange = (open: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { hasPassword, identifier, requiresCurrentPassword, isOpen, onOpenChange, form, passwordFeedback };
}
