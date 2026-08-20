import { Button } from '@clerk/ui/mosaic/components/button';
import type {
  UserProfilePasswordField,
  UserProfilePasswordMode,
  UserProfilePasswordValues,
} from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import { UserProfilePasswordDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-password-dialog.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasswordDialog',
  label: 'Password',
  navigation: { category: 'Dialogs' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-dialog.view.tsx',
};

const emptyValues: UserProfilePasswordValues = {
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

function PasswordDialogStory({ mode }: { mode: UserProfilePasswordMode }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(emptyValues);
  const canSubmit = Boolean(values.newPassword) && values.newPassword === values.confirmPassword;
  const label = mode === 'set' ? 'Set password' : 'Change password';

  const updateValue = <Field extends UserProfilePasswordField>(
    field: Field,
    value: UserProfilePasswordValues[Field],
  ) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <UserProfilePasswordDialogView
        open={open}
        onOpenChange={setOpen}
        values={values}
        mode={mode}
        canSubmit={canSubmit}
        errors={
          values.confirmPassword && values.newPassword !== values.confirmPassword
            ? { confirmPassword: 'Passwords do not match.' }
            : undefined
        }
        onValueChange={updateValue}
        onSubmit={() => {
          setOpen(false);
          setValues(emptyValues);
        }}
      />
    </>
  );
}

export function Change() {
  return <PasswordDialogStory mode='change' />;
}

export function Set() {
  return <PasswordDialogStory mode='set' />;
}
