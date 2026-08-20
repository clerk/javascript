import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { ReverificationDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/reverification-dialog.view';
import type {
  UserProfilePasswordField,
  UserProfilePasswordMode,
  UserProfilePasswordValues,
} from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import { UserProfilePasswordDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import { useState } from 'react';

const emptyValues: UserProfilePasswordValues = {
  newPassword: '',
  confirmPassword: '',
  signOutOfOtherSessions: true,
};

export function usePasswordDialogStory({
  mode = 'change',
  withVerification = true,
}: {
  mode?: UserProfilePasswordMode;
  withVerification?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [code, setCode] = useState('');
  const [values, setValues] = useState(emptyValues);
  const canSubmit = Boolean(values.newPassword) && values.newPassword === values.confirmPassword;

  const updateValue = <Field extends UserProfilePasswordField>(
    field: Field,
    value: UserProfilePasswordValues[Field],
  ) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  const complete = () => {
    setVerificationOpen(false);
    setCode('');
    setOpen(false);
    setValues(emptyValues);
  };

  return {
    openPasswordDialog: () => setOpen(true),
    passwordDialog: (
      <UserProfilePasswordDialogView
        open={open}
        onOpenChange={nextOpen => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setVerificationOpen(false);
          }
        }}
        canSubmit={canSubmit}
        state={{
          mode,
          values,
          isSubmitting: false,
          errors:
            values.confirmPassword && values.newPassword !== values.confirmPassword
              ? { confirmPassword: 'Passwords do not match.' }
              : {},
        }}
        onValueChange={updateValue}
        onSubmit={() => {
          if (withVerification) {
            setVerificationOpen(true);
            return;
          }
          complete();
        }}
        verificationDialog={
          withVerification ? (
            <Dialog
              open={verificationOpen}
              onOpenChange={nextOpen => {
                setVerificationOpen(nextOpen);
                if (!nextOpen) {
                  setCode('');
                }
              }}
            >
              <ReverificationDialogView
                state={{
                  strategy: 'email_code',
                  identifier: 'i••••@clerk.dev',
                  value: code,
                  status: 'idle',
                  errors: {},
                  resend: { isResending: false, secondsRemaining: 0 },
                }}
                onCancel={() => setVerificationOpen(false)}
                onResend={() => undefined}
                onSubmit={complete}
                onValueChange={setCode}
              />
            </Dialog>
          ) : null
        }
      />
    ),
  };
}
