import type { FormEvent } from 'react';
import { useId, useRef } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogTriggerProps } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import type { UserProfileFormError } from './user-profile-account-section.types';

export type UserProfileEditUsernameField = 'username';

export interface UserProfileEditUsernameViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  username: string;
  onUsernameChange: (value: string) => void;
  canSave?: boolean;
  isSaving?: boolean;
  error?: UserProfileFormError<UserProfileEditUsernameField>;
  onSubmit: () => void;
}

/**
 * Edits the user's username. Holds nothing, and validates nothing: acceptability arrives as
 * `canSave`, and the username the API will actually take is the API's to decide, so a rejection
 * comes back as `error`.
 */
export function UserProfileEditUsernameView({
  open,
  onOpenChange,
  trigger,
  username,
  onUsernameChange,
  canSave = true,
  isSaving = false,
  error,
  onSubmit,
}: UserProfileEditUsernameViewProps) {
  const formId = useId();
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && !isSaving) {
      onSubmit();
    }
  };

  return (
    <Dialog.Root
      closedBy='closerequest'
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        size='card'
        // Past the corner dismiss `Card.Header` renders first.
        initialFocus={usernameRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.username.dialogTitle}</Card.Title>
          </Card.Header>

          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={handleSubmit}
              />
            }
          >
            {error?.message ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{error.message}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Field.Root invalid={Boolean(error?.fields?.username)}>
              <Field.Label>{m.username.fieldLabel}</Field.Label>
              <Input
                ref={usernameRef}
                autoComplete='username'
                disabled={isSaving}
                value={username}
                onChange={event => onUsernameChange(event.target.value)}
              />
              {error?.fields?.username ? <Field.Error>{error.fields.username}</Field.Error> : null}
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
              form={formId}
              fullWidth
              isPending={isSaving}
              disabled={!canSave}
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
