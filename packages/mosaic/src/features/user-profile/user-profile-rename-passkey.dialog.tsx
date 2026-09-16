import { useId, useRef } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { userProfilePasskeysMessages as m } from './user-profile-passkeys-section.messages';

export interface UserProfileRenamePasskeyDialogProps {
  handle: DialogHandle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  canSave: boolean;
  isSaving?: boolean;
  error?: string;
  onSubmit: () => void;
}

export function UserProfileRenamePasskeyDialog({
  handle,
  open,
  onOpenChange,
  name,
  onNameChange,
  canSave,
  isSaving = false,
  error,
  onSubmit,
}: UserProfileRenamePasskeyDialogProps) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog.Root
      handle={handle}
      open={open}
      onOpenChange={onOpenChange}
      closedBy='closerequest'
    >
      <Dialog.Popup
        size='card'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.renameTitle}</Card.Title>
            <Card.Description>{m.renameDescription}</Card.Description>
          </Card.Header>
          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={event => {
                  event.preventDefault();
                  if (canSave && !isSaving) {
                    onSubmit();
                  }
                }}
              />
            }
          >
            {error ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{error}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Field.Root
              required
              disabled={isSaving}
            >
              <Field.Label>{m.nameLabel}</Field.Label>
              <Input
                ref={inputRef}
                autoComplete='off'
                value={name}
                onChange={event => onNameChange(event.target.value)}
              />
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  fullWidth
                  disabled={isSaving}
                >
                  {m.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isSaving}
              disabled={!canSave}
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
