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
import type { UserProfileFormError, UserProfileNameAttribute } from './user-profile-account-section.types';

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
  /** A disabled attribute drops its field; a required one blocks the submit while empty. */
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  isSaving?: boolean;
  error?: UserProfileFormError<UserProfileEditNameField>;
  onSave: () => void;
}

/**
 * Edits the user's first and last name. Holds nothing, and validates nothing beyond the native
 * `required` the instance asks for: the name the API will take is the API's to decide, so the action
 * stays live and a rejection comes back as `error`.
 */
export function UserProfileEditNameView({
  open,
  onOpenChange,
  trigger,
  firstName,
  lastName,
  firstNameAttribute = {},
  lastNameAttribute = {},
  onFirstNameChange,
  onLastNameChange,
  isSaving = false,
  error,
  onSave,
}: UserProfileEditNameViewProps) {
  const formId = useId();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const { enabled: showFirstName = true, required: firstNameRequired = false } = firstNameAttribute;
  const { enabled: showLastName = true, required: lastNameRequired = false } = lastNameAttribute;

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
        initialFocus={initialFocusRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.name.dialogTitle}</Card.Title>
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
            {showFirstName ? (
              <Field.Root
                invalid={Boolean(error?.fields?.firstName)}
                required={firstNameRequired}
              >
                <Field.Label>{m.name.firstNameLabel}</Field.Label>
                <Input
                  ref={initialFocusRef}
                  autoComplete='given-name'
                  disabled={isSaving}
                  value={firstName}
                  onChange={event => onFirstNameChange(event.target.value)}
                />
                {error?.fields?.firstName ? <Field.Error>{error.fields.firstName}</Field.Error> : null}
              </Field.Root>
            ) : null}
            {showLastName ? (
              <Field.Root
                invalid={Boolean(error?.fields?.lastName)}
                required={lastNameRequired}
              >
                <Field.Label>{m.name.lastNameLabel}</Field.Label>
                <Input
                  ref={showFirstName ? undefined : initialFocusRef}
                  autoComplete='family-name'
                  disabled={isSaving}
                  value={lastName}
                  onChange={event => onLastNameChange(event.target.value)}
                />
                {error?.fields?.lastName ? <Field.Error>{error.fields.lastName}</Field.Error> : null}
              </Field.Root>
            ) : null}
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
