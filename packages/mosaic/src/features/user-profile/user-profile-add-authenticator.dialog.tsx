import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget, DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Otp } from '../../components/otp';
import { userProfileAddAuthenticatorMessages as m } from './user-profile-add-authenticator.messages';
import { styles } from './user-profile-add-authenticator.styles';
import type { UserProfileAuthenticatorSetupViewProps } from './user-profile-authenticator-setup.view';
import { UserProfileAuthenticatorSetupView } from './user-profile-authenticator-setup.view';

export interface UserProfileAddAuthenticatorDialogProps extends UserProfileAuthenticatorSetupViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  finalFocus?: DialogFocusTarget;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code: string) => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function UserProfileAddAuthenticatorDialog({
  open,
  onOpenChange,
  trigger,
  finalFocus,
  secret,
  uri,
  code,
  onCodeChange,
  onSubmit,
  isPending = false,
  errorMessage,
}: UserProfileAddAuthenticatorDialogProps) {
  const formId = useId();
  const submitCode = (value: string) => {
    if (!isPending && value.length === 6) {
      onSubmit(value);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <UserProfileAuthenticatorSetupView
            secret={secret}
            uri={uri}
          />
          <Card.Content
            xstyle={styles.verification}
            render={
              <form
                id={formId}
                onSubmit={event => {
                  event.preventDefault();
                  submitCode(code);
                }}
              />
            }
          >
            <Field.Root
              required
              disabled={isPending}
              invalid={Boolean(errorMessage)}
              xstyle={styles.field}
            >
              <Field.Label xstyle={styles.label}>{m.codeLabel}</Field.Label>
              <Otp
                name='code'
                value={code}
                onValueChange={onCodeChange}
                onComplete={submitCode}
              />
              <Field.Message>
                <Field.Error>{errorMessage}</Field.Error>
              </Field.Message>
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                  disabled={isPending}
                />
              }
            >
              {m.cancel}
            </Dialog.Close>
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isPending}
              disabled={code.length !== 6}
              pendingLabel={m.pending}
            >
              {m.verify}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
