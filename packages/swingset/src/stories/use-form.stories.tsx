import { Banner } from '@clerk/mosaic/components/banner';
import { SubmitButton } from '@clerk/mosaic/components/button';
import { Field } from '@clerk/mosaic/components/field';
import type { FieldFeedback, TextFieldName, UseFormResult } from '@clerk/mosaic/components/form';
import { FormSubmitError, useForm } from '@clerk/mosaic/components/form';
import { InputGroup } from '@clerk/mosaic/components/input-group';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Hooks',
  status: 'stable',
  title: 'useForm',
  source: 'packages/mosaic/src/components/form/use-form.ts',
};

const styles = stylex.create({
  form: {
    display: 'grid',
    gap: 16,
    maxWidth: 384,
    width: '100%',
  },
  field: {
    display: 'grid',
    gap: 8,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

interface ProfileValues {
  username: string;
  displayName: string;
}

const TAKEN = new Set(['clerk', 'admin']);

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function checkUsername(value: string): Promise<FieldFeedback | undefined> {
  await wait(600);
  return TAKEN.has(value)
    ? { type: 'error', message: `@${value} is already taken.` }
    : { type: 'success', message: `@${value} is available.` };
}

async function saveProfile(values: ProfileValues): Promise<void> {
  await wait(800);
  if (values.username === 'error') {
    throw new FormSubmitError<ProfileValues>({
      message: 'Your profile could not be saved.',
      fields: { username: 'That username is reserved.' },
    });
  }
}

function TextField({
  form,
  name,
  label,
}: {
  form: UseFormResult<ProfileValues>;
  name: TextFieldName<ProfileValues>;
  label: string;
}) {
  const { feedback } = form.fields[name];
  return (
    <Field.Root
      xstyle={styles.field}
      disabled={form.isSubmitting}
      invalid={feedback?.type === 'error'}
      required
    >
      <Field.Label>{label}</Field.Label>
      <InputGroup.Root>
        <InputGroup.Input {...form.register(name)} />
      </InputGroup.Root>
      <Field.Message>
        <Field.Error>{feedback?.type === 'error' ? feedback.message : null}</Field.Error>
        <Field.Success>{feedback?.type === 'success' ? feedback.message : null}</Field.Success>
      </Field.Message>
    </Field.Root>
  );
}

export function Default() {
  const form = useForm<ProfileValues>({
    initialValues: { username: 'alex', displayName: 'Alex' },
    fields: {
      username: {
        validate: value => (value.length < 3 ? { type: 'error', message: 'Use at least 3 characters.' } : undefined),
        validateAsync: checkUsername,
      },
      displayName: {
        validate: value => (value.trim() === '' ? { type: 'error', message: 'Enter a display name.' } : undefined),
      },
    },
    onSubmit: saveProfile,
  });

  return (
    <form
      id={form.id}
      onSubmit={form.handleSubmit}
      {...stylex.props(styles.form)}
    >
      {form.error ? (
        <Banner.Root color='negative'>
          <Banner.Label>{form.error}</Banner.Label>
        </Banner.Root>
      ) : null}
      <TextField
        form={form}
        name='username'
        label='Username'
      />
      <TextField
        form={form}
        name='displayName'
        label='Display name'
      />
      <div {...stylex.props(styles.actions)}>
        <SubmitButton
          isPending={form.isSubmitting}
          disabled={!form.canSubmit || !form.isDirty}
        >
          Save
        </SubmitButton>
      </div>
    </form>
  );
}
