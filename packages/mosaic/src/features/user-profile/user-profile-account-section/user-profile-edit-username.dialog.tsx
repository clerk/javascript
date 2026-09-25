import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { useMessages } from '../../../localization';

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
}

export function UserProfileEditUsernameDialog({
  open,
  onOpenChange,
  trigger,
  title,
  form,
}: UserProfileEditUsernameDialogProps) {
  const m = useMessages('userProfileAccountSection');
  const usernameRef = useRef<HTMLInputElement>(null);
  const { feedback } = form.fields.username;
  const error = feedback?.type === 'error' ? feedback.message : undefined;
  const { ref, ...control } = form.register('username');
  const mergedRef = useMergeRefs([ref, usernameRef]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
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
          <Card.Header>
            <Card.Title>{title ?? m.username.dialogTitle}</Card.Title>
          </Card.Header>

          <Card.Content
            render={
              <form
                id={form.id}
                onSubmit={form.handleSubmit}
              />
            }
          >
            {form.error ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{form.error}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Field.Root
              disabled={form.isSubmitting}
              invalid={error !== undefined}
            >
              <Field.Label>{m.username.fieldLabel}</Field.Label>
              <Input
                ref={mergedRef}
                autoComplete='username'
                {...control}
              />
              {error ? <Field.Error>{error}</Field.Error> : null}
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                >
                  {m.username.cancel}
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
              {m.username.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
