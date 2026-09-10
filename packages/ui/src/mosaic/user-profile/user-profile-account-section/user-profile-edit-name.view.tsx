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

export type UserProfileEditNameField = 'firstName' | 'lastName';

export interface UserProfileEditNameValue {
  firstName: string;
  lastName: string;
}

export interface UserProfileEditNameViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendering the opener here is what returns focus to it on close. */
  trigger?: DialogTriggerProps['render'];
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  isSaving?: boolean;
  error?: UserProfileFormError<UserProfileEditNameField>;
  onSave: () => void;
}

/**
 * Edits the user's first and last name. Holds nothing, and validates nothing: the name the API will
 * take is the API's to decide, so the action stays live and a rejection comes back as `error`.
 */
export function UserProfileEditNameView({
  open,
  onOpenChange,
  trigger,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  isSaving = false,
  error,
  onSave,
}: UserProfileEditNameViewProps) {
  const formId = useId();
  const firstNameRef = useRef<HTMLInputElement>(null);

  // `isSaving` only cancels the press on the action; it does not stop a native submit.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSaving) {
      onSave();
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
        initialFocus={firstNameRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.name.dialogTitle}</Card.Title>
          </Card.Header>
          {/* Not `Root`: the header's dismiss would become the form's default submit, since
              `Button` sets no `type`. */}
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
            <Field.Root invalid={Boolean(error?.fields?.firstName)}>
              <Field.Label>{m.name.firstNameLabel}</Field.Label>
              <Input
                ref={firstNameRef}
                autoComplete='given-name'
                disabled={isSaving}
                value={firstName}
                onChange={event => onFirstNameChange(event.target.value)}
              />
              {error?.fields?.firstName ? <Field.Error>{error.fields.firstName}</Field.Error> : null}
            </Field.Root>
            <Field.Root invalid={Boolean(error?.fields?.lastName)}>
              <Field.Label>{m.name.lastNameLabel}</Field.Label>
              <Input
                autoComplete='family-name'
                disabled={isSaving}
                value={lastName}
                onChange={event => onLastNameChange(event.target.value)}
              />
              {error?.fields?.lastName ? <Field.Error>{error.fields.lastName}</Field.Error> : null}
            </Field.Root>
            {/* Two fields and no in-form submit button means no implicit submission, so Enter would
                do nothing. Unnecessary at one field; see `Destructive`. */}
            <button
              hidden
              type='submit'
              tabIndex={-1}
              aria-hidden='true'
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
                  {m.name.cancel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isSaving}
            >
              {m.name.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
