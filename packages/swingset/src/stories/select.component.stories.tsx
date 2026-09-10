import { Field } from '@clerk/ui/mosaic/components/field';
import { Select } from '@clerk/ui/mosaic/components/select';
import { Text } from '@clerk/ui/mosaic/components/text';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './select.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Select',
  source: 'packages/ui/src/mosaic/components/select/select.tsx',
};

const roleFilters = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

/** The selected option opens over the trigger, like a native `<select>`. */
export function Default() {
  return (
    <Select.Root
      items={roleFilters}
      defaultValue='all'
    >
      <Select.Trigger />
      <Select.Popup />
    </Select.Root>
  );
}

const roles = [
  { value: 'member', label: 'Member', description: 'Role with non-privileged permissions in the organization.' },
  { value: 'admin', label: 'Admin', description: 'Role with elevated permissions in the organization.' },
];

/**
 * Rows with a description are taller than the trigger, so nothing in them could line up with it:
 * the list hangs below the trigger instead, with `alignItemWithTrigger={false}`.
 */
export function Descriptions() {
  return (
    <Field.Root style={{ display: 'grid', gap: 8, maxWidth: 384 }}>
      <Field.Label>Role</Field.Label>
      <Select.Root
        items={roles}
        defaultValue='member'
        alignItemWithTrigger={false}
      >
        <Select.Trigger />
        <Select.Popup />
      </Select.Root>
    </Field.Root>
  );
}

const members = [
  { name: 'Preston Booth', email: 'preston@clerk.dev', role: 'member' },
  { name: 'Colin Sidoti', email: 'colin@clerk.dev', role: 'admin' },
];

/** The `ghost` trigger drops the border for a select that sits inside a table row. */
export function Ghost() {
  return (
    <div style={{ display: 'grid', maxWidth: 480 }}>
      {members.map(member => (
        <div
          key={member.email}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 16,
            paddingBlock: 8,
            borderBlockEnd: '1px solid var(--cl-color-border-faded)',
          }}
        >
          <div style={{ display: 'grid' }}>
            <Text>{member.name}</Text>
            <Text
              size='sm'
              color='neutral'
            >
              {member.email}
            </Text>
          </div>
          <Select.Root
            items={roles}
            defaultValue={member.role}
          >
            <Select.Trigger variant='ghost' />
            <Select.Popup />
          </Select.Root>
        </div>
      ))}
    </div>
  );
}

/** A `placeholder` fills the trigger until something is chosen. */
export function Placeholder() {
  return (
    <Select.Root items={roleFilters}>
      <Select.Trigger placeholder='Choose a role' />
      <Select.Popup />
    </Select.Root>
  );
}

export function Controlled() {
  const [value, setValue] = useState('member');

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Select.Root
        items={roleFilters}
        value={value}
        onValueChange={setValue}
      >
        <Select.Trigger />
        <Select.Popup />
      </Select.Root>
      <Text size='sm'>Selected: {value}</Text>
    </div>
  );
}

const timezones = Array.from({ length: 27 }, (_, index) => {
  const offset = index - 12;
  const sign = offset < 0 ? '-' : '+';
  return { value: `utc${sign}${Math.abs(offset)}`, label: `UTC${sign}${String(Math.abs(offset)).padStart(2, '0')}:00` };
});

/**
 * More rows than fit. The popup caps at the available height and the rows scroll inside it, with
 * the selected row still opened over the trigger.
 */
export function Overflowing() {
  return (
    <Select.Root
      items={timezones}
      defaultValue='utc+0'
    >
      <Select.Trigger />
      <Select.Popup />
    </Select.Root>
  );
}
