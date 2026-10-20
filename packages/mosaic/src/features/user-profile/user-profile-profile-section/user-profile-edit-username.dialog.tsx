import { useMergeRefs } from '@floating-ui/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Flow, useFlowAutoFocus } from '../../../components/flow';
import type { UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import { Reverification } from '../../reverification';

export type UserProfileEditUsernameField = 'username';

export interface UserProfileEditUsernameValue {
  username: string;
}

export interface UserProfileEditUsernameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  title?: string;
  form: UseFormResult<UserProfileEditUsernameValue>;
  reverification?: ReverificationController;
  step: 'edit' | 'verify';
}

export function UserProfileEditUsernameDialog({
  open,
  onOpenChange,
  trigger,
  title,
  form,
  reverification,
  step,
}: UserProfileEditUsernameDialogProps) {
  const m = useMessages('userProfileProfileSection').username;
  const usernameRef = useRef<HTMLInputElement>(null);

  const edit = (
    <>
      <Card.Header>
        <Card.Title>{title ?? m.dialogTitle}</Card.Title>
      </Card.Header>

      <Card.Banner
        role='alert'
        color='negative'
      >
        {form.error}
      </Card.Banner>
      <Card.Content
        render={
          <form
            id={form.id}
            onSubmit={form.handleSubmit}
          />
        }
      >
        <UsernameField
          form={form}
          inputRef={usernameRef}
        />
      </Card.Content>
      <Card.Footer>
        <Dialog.Close
          render={
            <Button
              variant='outline'
              color='neutral'
              fullWidth
            >
              {m.cancel}
            </Button>
          }
        />
        <SubmitButton
          form={form.id}
          fullWidth
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
        initialFocus={usernameRef}
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

function UsernameField({
  form,
  inputRef,
}: {
  form: UseFormResult<UserProfileEditUsernameValue>;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const m = useMessages('userProfileProfileSection').username;
  const { feedback } = form.fields.username;
  const error = feedback?.type === 'error' ? feedback.message : undefined;
  const { ref, ...control } = form.register('username');
  const mergedRef = useMergeRefs([ref, inputRef, useFlowAutoFocus<HTMLInputElement>()]);

  return (
    <Field.Root
      disabled={form.isSubmitting}
      focusableWhenDisabled
      invalid={error !== undefined}
    >
      <Field.Label>{m.fieldLabel}</Field.Label>
      <Input
        ref={mergedRef}
        autoComplete='username'
        {...control}
      />
      <Field.Feedback feedback={feedback} />
    </Field.Root>
  );
}
