import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Field } from '@clerk/ui/mosaic/components/field';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Input } from '@clerk/ui/mosaic/components/input';
import { Text } from '@clerk/ui/mosaic/components/text';
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
          if (withVerification) {
            setVerificationOpen(true);
            return;
          }
          complete();
        }}
        verificationDialog={
          withVerification ? (
            <OtpVerificationPrompt
              open={verificationOpen}
              onOpenChange={setVerificationOpen}
              onVerify={complete}
            />
          ) : null
        }
      />
    ),
  };
}

// TODO: Replace this dummy OTP prompt with the full User Verification dialog implementation.
function OtpVerificationPrompt({
  open,
  onOpenChange,
  onVerify,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
}) {
  const [code, setCode] = useState('');

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setCode('');
        }
      }}
      closedBy='closerequest'
    >
      <Dialog.CloseButton />
      <Dialog.Title render={<Heading size='sm' />}>Verify your identity</Dialog.Title>
      <Dialog.Description render={<Text />}>Enter the verification code sent to your email address.</Dialog.Description>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onSubmit={event => {
          event.preventDefault();
          if (code.length === 6) {
            onVerify();
          }
        }}
      >
        <Field.Root
          required
          style={{ display: 'grid', gap: '0.5rem' }}
        >
          <Field.Label>Verification code</Field.Label>
          <Input
            name='code'
            autoComplete='one-time-code'
            inputMode='numeric'
            maxLength={6}
            value={code}
            onChange={event => setCode(event.target.value.replace(/\D/g, ''))}
          />
        </Field.Root>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Dialog.Close render={<Button variant='outline' />}>Cancel</Dialog.Close>
          <Button
            type='submit'
            disabled={code.length !== 6}
            focusableWhenDisabled
          >
            Verify
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
