'use client';
import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Button } from '@clerk/mosaic/components/button';
import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';
import * as React from 'react';

const ROW = 'flex items-center justify-between gap-4 px-5 py-4 text-sm';
const VALUE = 'text-neutral-600 dark:text-neutral-400';

export function CustomProfileCard({
  firstName,
  lastName,
  imageUrl,
  initialEmail,
}: {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  initialEmail: string;
}) {
  const [email, setEmail] = React.useState(initialEmail);
  const [draft, setDraft] = React.useState(initialEmail);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const name = `${firstName} ${lastName}`;
  const save = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setEmail(draft.trim() || email);
    setSaving(false);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(email);
    setEditing(false);
  };
  return (
    <div
      data-xray='custom-profile-card'
      className='flex w-full flex-col gap-8'
    >
      <div className='flex flex-col items-center gap-3 pt-2'>
        <Avatar.Root size='lg'>
          <Avatar.Image
            src={imageUrl}
            alt={name}
          />
          <Avatar.Fallback>{`${firstName[0]}${lastName[0]}`}</Avatar.Fallback>
        </Avatar.Root>
        <h2 className='text-3xl font-semibold tracking-[-0.02em]'>{name}</h2>
        <Badge color='neutral'>Free</Badge>
      </div>
      <div className='flex flex-col gap-3'>
        <h3 className='text-base font-medium'>Account details</h3>
        <div className='divide-y divide-[var(--cl-color-border,#e5e5e5)] overflow-hidden rounded-[var(--cl-radius-xl,1rem)] border border-[var(--cl-color-border,#e5e5e5)] bg-[var(--cl-color-surface-subtle,transparent)]'>
          <div className={ROW}>
            <span>First name</span>
            <span className={VALUE}>{firstName}</span>
          </div>
          <div className={ROW}>
            <span>Last name</span>
            <span className={VALUE}>{lastName}</span>
          </div>
          {editing ? (
            <form
              className='flex flex-col gap-3 px-5 py-4'
              onSubmit={event => {
                event.preventDefault();
                void save();
              }}
            >
              <Field.Root disabled={saving}>
                <Field.Label>Email</Field.Label>
                <Input
                  type='email'
                  autoComplete='email'
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                />
              </Field.Root>
              <div className='flex justify-end gap-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  color='neutral'
                  type='button'
                  disabled={saving}
                  onClick={cancel}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  type='submit'
                  disabled={saving || draft.trim() === ''}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          ) : (
            <div className={ROW}>
              <span>Email</span>
              <span className='flex items-center gap-3'>
                <span className={VALUE}>{email}</span>
                <Button
                  size='sm'
                  variant='outline'
                  color='neutral'
                  onClick={() => setEditing(true)}
                >
                  Change
                </Button>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
