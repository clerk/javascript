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

/** The two controls the dialog owns, and the keys `error.fields` is addressed by. */
export type UserProfileEditNameField = 'firstName' | 'lastName';

export interface UserProfileEditNameValue {
  firstName: string;
  lastName: string;
}

export interface UserProfileEditNameViewProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Asked to open or close. The caller owns the answer, including while a save is running. */
  onOpenChange: (open: boolean) => void;
  /** Element that opens the dialog. Rendering it here is what returns focus to it on close. */
  trigger?: DialogTriggerProps['render'];
  /** What is currently typed in each field. */
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  /** Whether the save is in flight. The fields go inert and the action announces itself busy. */
  isSaving?: boolean;
  /** Why the last save failed. */
  error?: UserProfileFormError<UserProfileEditNameField>;
  /** Submits, by the action or by Enter in either field. */
  onSave: () => void;
}

/**
 * Edits the user's first and last name.
 *
 * Holds nothing. Open state, the typed values, the pending flag and the error all come from the
 * caller — which is what lets the controller re-seed the fields on close and keep them through a
 * failed save without the view knowing either rule.
 *
 * Nothing is validated here. The name the API will take is the API's to decide, so the action stays
 * live and a rejection comes back as `error`.
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

  // The action sits in the footer, outside the form, so `form={formId}` associates the two.
  // `isSaving` is re-checked here because it only cancels the press on the action, and does not
  // stop a native submit.
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
        // Past the corner dismiss that `Card.Header` renders first: a form dialog opens on the
        // field it exists to edit.
        initialFocus={firstNameRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.name.dialogTitle}</Card.Title>
          </Card.Header>
          {/* The body IS the form, so `Card.Content`'s own column spaces the fields and nothing
              here needs a stylesheet. Safe on `Content` where it would not be on `Root`: the
              header's dismiss is a sibling, so it cannot become the form's default submit. */}
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
            {/* A form with two fields and no submit button inside it gets no implicit submission at
                all, so Enter in either field would do nothing. The footer's action cannot play that
                part from outside the form. A one-field dialog needs none of this; see `Destructive`. */}
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
