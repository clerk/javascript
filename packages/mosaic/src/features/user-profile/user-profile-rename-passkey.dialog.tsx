import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import { useMessages } from '../../localization';
import type { UserProfileRenamePasskeyValues } from './user-profile-passkeys-section/user-profile-passkeys-section.types';

export interface UserProfileRenamePasskeyDialogProps {
  handle: DialogHandle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileRenamePasskeyValues>;
}

export function UserProfileRenamePasskeyDialog({
  handle,
  open,
  onOpenChange,
  form,
}: UserProfileRenamePasskeyDialogProps) {
  const m = useMessages('userProfilePasskeys');
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref, ...control } = form.register('name');
  const mergedRef = useMergeRefs([ref, inputRef]);
  const feedback = form.fields.name.feedback;
  return (
    <Dialog.Root
      handle={handle}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup initialFocus={inputRef}>
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.renameTitle}</Card.Title>
            <Card.Description>{m.renameDescription}</Card.Description>
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
            <Field.Root
              required
              invalid={feedback?.type === 'error'}
              disabled={form.isSubmitting}
            >
              <Field.Label>{m.nameLabel}</Field.Label>
              <Input
                ref={mergedRef}
                autoComplete='off'
                {...control}
              />
              <Field.Feedback
                feedback={feedback}
                role={feedback?.type === 'error' ? 'alert' : 'status'}
              />
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                  disabled={form.isSubmitting}
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
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
