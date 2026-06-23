/** @jsxImportSource @emotion/react */
import { FilterChip } from '@clerk/ui/mosaic/components/filter-chip';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './filter-chip.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'FilterChip',
  label: 'Filter Chip',
  source: 'packages/ui/src/mosaic/components/filter-chip.tsx',
};

const ROLE_ITEMS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const SORT_ITEMS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'joined', label: 'Date joined' },
];

export function Default() {
  const [role, setRole] = useState<string | undefined>(undefined);
  return (
    <FilterChip
      label='Role'
      value={role}
      onValueChange={setRole}
      items={ROLE_ITEMS}
    />
  );
}

export function Selected() {
  const [role, setRole] = useState<string | undefined>('admin');
  return (
    <FilterChip
      label='Role'
      value={role}
      onValueChange={setRole}
      items={ROLE_ITEMS}
    />
  );
}

export function NotClearable() {
  const [sort, setSort] = useState<string | undefined>('name');
  return (
    <FilterChip
      label='Sort'
      value={sort}
      onValueChange={v => setSort(v ?? 'name')}
      items={SORT_ITEMS}
      clearable={false}
    />
  );
}

export function BothStates() {
  const [role, setRole] = useState<string | undefined>('admin');
  const [sort, setSort] = useState<string | undefined>('name');
  const [mfa, setMfa] = useState<string | undefined>(undefined);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <FilterChip
        label='MFA'
        value={mfa}
        onValueChange={setMfa}
        items={[
          { value: 'enabled', label: 'Enabled' },
          { value: 'disabled', label: 'Disabled' },
        ]}
      />
      <FilterChip
        label='Role'
        value={role}
        onValueChange={setRole}
        items={ROLE_ITEMS}
      />
      <FilterChip
        label='Sort'
        value={sort}
        onValueChange={v => setSort(v ?? 'name')}
        items={SORT_ITEMS}
        clearable={false}
      />
    </div>
  );
}
