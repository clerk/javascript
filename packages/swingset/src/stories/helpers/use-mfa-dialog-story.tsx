import type {
  UserProfileMfaAddFlowState,
  UserProfileMfaMethodType,
  UserProfileMfaRemoveFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import {
  UserProfileMfaAddDialogView,
  UserProfileMfaRemoveDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-mfa-dialog.view';
import type { UserProfileMfaMethod } from '@clerk/ui/mosaic/user-profile/user-profile-mfa-section.view';
import { useState } from 'react';

const IDLE_RESEND = { isResending: false, secondsRemaining: 0 };

export function useMfaDialogStory({
  methods,
  onChange,
}: {
  methods: UserProfileMfaMethod[];
  onChange: (methods: UserProfileMfaMethod[]) => void;
}) {
  const [add, setAdd] = useState<UserProfileMfaAddFlowState | null>(null);
  const [remove, setRemove] = useState<UserProfileMfaRemoveFlowState | null>(null);

  const openAddMfaDialog = (method: UserProfileMfaMethodType) => {
    setAdd(
      method === 'sms'
        ? { method, step: 'phone', phoneNumber: '+1', isSubmitting: false, errors: {} }
        : {
            method,
            step: 'setup',
            displayFormat: 'qr',
            secret: 'JBSWY3DPEHPK3PXP',
            isSubmitting: false,
            errors: {},
          },
    );
  };

  const submitAddMfa = () => {
    if (!add) {
      return;
    }
    if (add.step === 'phone') {
      setAdd({
        method: 'sms',
        step: 'verify',
        identifier: add.phoneNumber,
        code: '',
        status: 'idle',
        resend: IDLE_RESEND,
        isSubmitting: false,
        errors: {},
      });
      return;
    }
    if (add.step === 'setup') {
      setAdd({
        method: 'authenticator',
        step: 'verify',
        code: '',
        status: 'idle',
        resend: IDLE_RESEND,
        isSubmitting: false,
        errors: {},
      });
      return;
    }
    const nextMethod: UserProfileMfaMethod =
      add.method === 'sms'
        ? { id: `sms-${Date.now()}`, type: 'sms', description: add.identifier }
        : { id: `authenticator-${Date.now()}`, type: 'authenticator' };
    onChange([...methods.filter(method => method.type !== add.method), nextMethod]);
    setAdd(null);
  };

  const openRemoveMfaDialog = (id: string) => {
    const method = methods.find(candidate => candidate.id === id);
    if (!method || method.type === 'backup-codes') {
      return;
    }
    setRemove({
      id,
      method: method.type,
      label: method.description ?? 'Authenticator app',
      isSubmitting: false,
      errors: {},
    });
  };

  return {
    openAddMfaDialog,
    openRemoveMfaDialog,
    mfaDialogs: (
      <>
        {add ? (
          <UserProfileMfaAddDialogView
            open
            state={add}
            onOpenChange={open => {
              if (!open) {
                setAdd(null);
              }
            }}
            onCodeChange={code =>
              setAdd(current =>
                current && current.step === 'verify' ? { ...current, code, status: 'idle', errors: {} } : current,
              )
            }
            onPhoneNumberChange={phoneNumber =>
              setAdd(current => (current && current.step === 'phone' ? { ...current, phoneNumber } : current))
            }
            onResend={() => undefined}
            onSubmit={submitAddMfa}
            onToggleDisplayFormat={() =>
              setAdd(current =>
                current && current.step === 'setup'
                  ? { ...current, displayFormat: current.displayFormat === 'qr' ? 'key' : 'qr' }
                  : current,
              )
            }
          />
        ) : null}
        {remove ? (
          <UserProfileMfaRemoveDialogView
            open
            state={remove}
            onOpenChange={open => {
              if (!open) {
                setRemove(null);
              }
            }}
            onRemove={() => {
              onChange(methods.filter(method => method.id !== remove.id));
              setRemove(null);
            }}
          />
        ) : null}
      </>
    ),
  };
}
