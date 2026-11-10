import { useMergeRefs } from '@floating-ui/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { ChangePassword } from '../../../blocks/change-password';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PasswordInput } from '../../../components/password-input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { ReverificationController } from '../../reverification';
import { Reverification } from '../../reverification';
import type { UserProfileEditPasswordValues } from './user-profile-password-section.types';

export interface UserProfileEditPasswordDialogProps {
  passwordFeedback?: FieldFeedback;
  identifier?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  hasPassword?: boolean;
  requiresCurrentPassword?: boolean;
  form: UseFormResult<UserProfileEditPasswordValues>;
  reverification?: ReverificationController;
  step: 'edit' | 'verify';
}

export function UserProfileEditPasswordDialog({
  passwordFeedback,
  identifier = '',
  open,
  onOpenChange,
  trigger,
  hasPassword = false,
  requiresCurrentPassword = false,
  form,
  reverification,
  step,
}: UserProfileEditPasswordDialogProps) {
  const m = useMessages('userProfile').password;
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const showCurrentPassword = hasPassword && requiresCurrentPassword;

  const edit = (
    <>
      <Card.Header>
        <Card.Title>{hasPassword ? m.dialogTitle.change : m.dialogTitle.set}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error}
      </Card.Banner>
      <Card.Content
        render={
          <Form
            id={form.id}
            onSubmit={form.handleSubmit}
          />
        }
      >
        {showCurrentPassword ? (
          <CurrentPasswordField
            form={form}
            inputRef={initialFocusRef}
          />
        ) : null}
        <ChangePassword
          messages={{
            newPasswordLabel: m.newPasswordLabel,
            confirmPasswordLabel: m.confirmPasswordLabel,
            signOutOfOtherSessionsLabel: m.signOutOfOtherSessionsLabel,
            signOutOfOtherSessionsDescription: m.signOutOfOtherSessionsDescription,
            showPasswordLabel: m.showPassword,
            hidePasswordLabel: m.hidePassword,
          }}
          identifier={identifier}
          newPassword={form.register('newPassword')}
          confirmPassword={form.register('confirmPassword')}
          fields={form.fields}
          signOutOfOtherSessions={form.values.signOutOfOtherSessions}
          onSignOutOfOtherSessionsChange={checked => form.setValue('signOutOfOtherSessions', checked)}
          passwordFeedback={passwordFeedback}
          disabled={form.isSubmitting}
          focusRef={showCurrentPassword ? undefined : initialFocusRef}
        />
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              variant='outline'
              color='neutral'
            >
              {m.cancel}
            </Button>
          }
        />
        <SubmitButton
          form={form.id}
          isPending={form.isSubmitting}
          disabled={!form.canSubmit}
          focusableWhenDisabled
        >
          {m.save}
        </SubmitButton>
      </Card.Footer>
    </>
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldCloseOnInteractOutside={step !== 'verify'}
      showCloseButton={step !== 'verify' || Boolean(reverification?.onCancel)}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={initialFocusRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          {reverification ? (
            <Flow.Root
              value={step}
              direction={step === 'verify' ? 1 : -1}
              state={step}
            >
              {() => (
                <>
                  <Flow.Step ids={['edit']}>{edit}</Flow.Step>
                  <Flow.Step ids={['verify']}>
                    <Reverification
                      controller={reverification}
                      onClose={() => onOpenChange(false)}
                    />
                  </Flow.Step>
                </>
              )}
            </Flow.Root>
          ) : (
            edit
          )}
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function CurrentPasswordField({
  form,
  inputRef,
}: {
  form: UseFormResult<UserProfileEditPasswordValues>;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const m = useMessages('userProfile').password;
  const { feedback } = form.fields.currentPassword;
  const { ref, ...control } = form.register('currentPassword');
  const mergedRef = useMergeRefs([ref, inputRef, useFlowAutoFocus<HTMLInputElement>()]);

  return (
    <Field.Root
      disabled={form.isSubmitting}
      focusableWhenDisabled
      invalid={feedback?.type === 'error'}
      required
    >
      <Field.Label>{m.currentPasswordLabel}</Field.Label>
      <PasswordInput
        ref={mergedRef}
        autoComplete='current-password'
        {...control}
        showPasswordLabel={m.showPassword}
        hidePasswordLabel={m.hidePassword}
      />
      <Field.Feedback feedback={feedback?.type === 'error' ? feedback : undefined} />
    </Field.Root>
  );
}
