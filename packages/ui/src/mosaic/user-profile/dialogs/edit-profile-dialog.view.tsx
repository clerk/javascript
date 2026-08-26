import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import type {
  EditAvatarActions,
  EditAvatarState,
  EditNameActions,
  EditNameState,
  EditUsernameActions,
  EditUsernameState,
} from './flow.types';
import { DialogBody, DialogFooter, DialogForm, DialogHeader, FormAlert, MutedText } from './flow-dialog-chrome';
import { styles } from './flow-dialogs.styles';

/**
 * The three single-step profile forms. Unlike the contact flows there is nothing to verify, so
 * each is one surface with a pending state and an error slot — but they are not all the same:
 * the name form can be read-only, the username form is the one a reverification challenge is most
 * likely to interrupt, and the avatar form validates locally before it ever calls the server.
 */

export interface EditNameDialogViewProps extends EditNameActions {
  state: EditNameState;
  /** True while a reverification challenge is stacked over this dialog. */
  isInterrupted?: boolean;
}

export function EditNameDialogView({
  state,
  isInterrupted = false,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onCancel,
}: EditNameDialogViewProps) {
  const firstNameId = React.useId();
  const lastNameId = React.useId();
  const locked = state.isReadOnly || state.isSubmitting || isInterrupted;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader title='Update profile' />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          {state.isReadOnly ? (
            <MutedText>Your profile information is managed by your organization and cannot be edited here.</MutedText>
          ) : null}
          <FormAlert>{state.errors.form}</FormAlert>
          <div {...stylex.props(styles.fields)}>
            <Field.Root invalid={Boolean(state.errors.firstName)}>
              <Field.Label htmlFor={firstNameId}>First name</Field.Label>
              <Input
                autoComplete='given-name'
                autoFocus={!state.isReadOnly}
                disabled={locked}
                id={firstNameId}
                value={state.firstName}
                onChange={event => onFirstNameChange(event.target.value)}
              />
              {state.errors.firstName ? <Field.Error>{state.errors.firstName}</Field.Error> : null}
            </Field.Root>
            <Field.Root invalid={Boolean(state.errors.lastName)}>
              <Field.Label htmlFor={lastNameId}>Last name</Field.Label>
              <Input
                autoComplete='family-name'
                disabled={locked}
                id={lastNameId}
                value={state.lastName}
                onChange={event => onLastNameChange(event.target.value)}
              />
              {state.errors.lastName ? <Field.Error>{state.errors.lastName}</Field.Error> : null}
            </Field.Root>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            disabled={state.isSubmitting}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            Cancel
          </Button>
          {/* A read-only form keeps Cancel as its only action, as the legacy page does. */}
          {state.isReadOnly ? null : (
            <SubmitButton
              disabled={isInterrupted}
              isPending={state.isSubmitting}
              pendingLabel='Saving'
              {...stylex.props(styles.footerButton)}
            >
              Save
            </SubmitButton>
          )}
        </DialogFooter>
      </DialogForm>
    </>
  );
}

export interface EditUsernameDialogViewProps extends EditUsernameActions {
  state: EditUsernameState;
  isInterrupted?: boolean;
}

export function EditUsernameDialogView({
  state,
  isInterrupted = false,
  onValueChange,
  onSubmit,
  onCancel,
}: EditUsernameDialogViewProps) {
  const fieldId = React.useId();

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader title={state.hasUsername ? 'Update username' : 'Set username'} />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          <Field.Root
            invalid={Boolean(state.errors.field)}
            required
          >
            <Field.Label htmlFor={fieldId}>Username</Field.Label>
            <Input
              autoComplete='username'
              autoFocus
              disabled={state.isSubmitting || isInterrupted}
              id={fieldId}
              value={state.value}
              onChange={event => onValueChange(event.target.value)}
            />
            {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
          </Field.Root>
        </DialogBody>
        <DialogFooter>
          <Button
            color='neutral'
            disabled={state.isSubmitting}
            type='button'
            variant='outline'
            onClick={onCancel}
            {...stylex.props(styles.footerButton)}
          >
            Cancel
          </Button>
          <SubmitButton
            disabled={isInterrupted}
            isPending={state.isSubmitting}
            pendingLabel='Saving'
            {...stylex.props(styles.footerButton)}
          >
            Save
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </>
  );
}

export interface EditAvatarDialogViewProps extends EditAvatarActions {
  state: EditAvatarState;
  /** Initials shown when there is no image to preview. */
  fallback: string;
  isInterrupted?: boolean;
}

/** Mirrors the legacy uploader's constraints, which it enforces before calling the server. */
const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/gif,image/webp';

export function EditAvatarDialogView({
  state,
  fallback,
  isInterrupted = false,
  onSelectFile,
  onSubmit,
  onRemove,
  onCancel,
}: EditAvatarDialogViewProps) {
  const fieldId = React.useId();
  const busy = state.status !== 'idle' || isInterrupted;

  return (
    <>
      <Dialog.CloseButton />
      <DialogHeader
        description='Recommended size 1:1, up to 10MB. PNG, JPEG, GIF or WebP.'
        title='Update profile picture'
      />
      <DialogForm onSubmit={onSubmit}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
          <div {...stylex.props(styles.avatarRow)}>
            <Avatar.Root size='fit'>
              <Avatar.Image
                alt=''
                src={state.previewUrl}
              />
              <Avatar.Fallback>{fallback}</Avatar.Fallback>
            </Avatar.Root>
            <Field.Root invalid={Boolean(state.errors.field)}>
              <Field.Label htmlFor={fieldId}>Image file</Field.Label>
              {/* TODO: Replace with a Mosaic FileUpload, built on `@clerk/headless/file-upload`.
                  A bare file input stands in — no drag-and-drop, which the legacy uploader has. */}
              <input
                accept={ACCEPTED_IMAGE_TYPES}
                disabled={busy}
                id={fieldId}
                type='file'
                onChange={event => {
                  const file = event.target.files?.[0];
                  // Cleared so re-picking the same file after a failed upload still fires `change`.
                  event.target.value = '';
                  if (file) {
                    onSelectFile(file);
                  }
                }}
              />
              {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
            </Field.Root>
          </div>
          {state.fileName ? <MutedText>{state.fileName}</MutedText> : null}
        </DialogBody>
        <DialogFooter spread={state.canRemove}>
          {state.canRemove ? (
            <Button
              color='negative'
              disabled={busy}
              focusableWhenDisabled
              variant='ghost'
              onClick={onRemove}
            >
              {state.status === 'removing' ? 'Removing…' : 'Remove'}
            </Button>
          ) : null}
          <div {...stylex.props(styles.footerActions)}>
            <Button
              color='neutral'
              disabled={state.status !== 'idle'}
              type='button'
              variant='outline'
              onClick={onCancel}
            >
              Cancel
            </Button>
            <SubmitButton
              disabled={isInterrupted || state.status === 'removing' || !state.fileName}
              isPending={state.status === 'uploading'}
              pendingLabel='Uploading'
            >
              Upload
            </SubmitButton>
          </div>
        </DialogFooter>
      </DialogForm>
    </>
  );
}
