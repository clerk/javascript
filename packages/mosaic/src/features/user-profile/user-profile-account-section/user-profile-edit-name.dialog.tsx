import { useMergeRefs } from '@floating-ui/react';
import type { RefObject } from 'react';
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
import type { UserProfileNameAttribute } from './user-profile-account-section.types';

export type UserProfileEditNameField = 'firstName' | 'lastName';

export interface UserProfileEditNameValue {
  firstName: string;
  lastName: string;
}

export interface UserProfileEditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rendering the opener here is what returns focus to it on close. */
  trigger?: DialogTriggerProps['render'];
  /** A disabled attribute drops its field; a required one blocks the submit while empty. */
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  title?: string;
  form: UseFormResult<UserProfileEditNameValue>;
}

/**
 * Edits the user's first and last name. Validates nothing beyond the native `required` the
 * instance asks for: the name the API will take is the API's to decide, so a rejection comes back
 * through the form.
 */
export function UserProfileEditNameDialog({
  open,
  onOpenChange,
  trigger,
  firstNameAttribute = {},
  lastNameAttribute = {},
  title,
  form,
}: UserProfileEditNameDialogProps) {
  const m = useMessages('userProfileAccountSection');
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const { enabled: showFirstName = true, required: firstNameRequired = false } = firstNameAttribute;
  const { enabled: showLastName = true, required: lastNameRequired = false } = lastNameAttribute;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
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
          <Card.Header>
            <Card.Title>{title ?? m.name.dialogTitle}</Card.Title>
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
            {showFirstName ? (
              <NameField
                autoComplete='given-name'
                form={form}
                inputRef={initialFocusRef}
                label={m.name.firstNameLabel}
                name='firstName'
                required={firstNameRequired}
              />
            ) : null}
            {showLastName ? (
              <NameField
                autoComplete='family-name'
                form={form}
                inputRef={showFirstName ? undefined : initialFocusRef}
                label={m.name.lastNameLabel}
                name='lastName'
                required={lastNameRequired}
              />
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
              form={form.id}
              fullWidth
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.name.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function NameField({
  label,
  autoComplete,
  form,
  inputRef,
  name,
  required,
}: {
  label: string;
  autoComplete: 'given-name' | 'family-name';
  form: UseFormResult<UserProfileEditNameValue>;
  inputRef?: RefObject<HTMLInputElement>;
  name: UserProfileEditNameField;
  required: boolean;
}) {
  const { feedback } = form.fields[name];
  const error = feedback?.type === 'error' ? feedback.message : undefined;
  const { ref, ...control } = form.register(name);
  const mergedRef = useMergeRefs([ref, inputRef]);

  return (
    <Field.Root
      disabled={form.isSubmitting}
      invalid={error !== undefined}
      required={required}
    >
      <Field.Label>{label}</Field.Label>
      <Input
        ref={mergedRef}
        autoComplete={autoComplete}
        {...control}
      />
      {error ? <Field.Error>{error}</Field.Error> : null}
    </Field.Root>
  );
}
