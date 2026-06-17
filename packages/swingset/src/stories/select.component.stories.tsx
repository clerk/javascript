/** @jsxImportSource @emotion/react */
import { Select, selectRecipe } from '@clerk/ui/mosaic/components/select';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './select.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Select',
  source: 'packages/ui/src/mosaic/components/select.tsx',
  styles: selectRecipe,
};

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango' },
];

export function Default() {
  return (
    <Select
      placement='bottom-start'
      sideOffset={4}
      trigger={p => (
        <button
          {...p}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            background: 'white',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Pick a fruit ▾
        </button>
      )}
    >
      {FRUITS.map(f => (
        <Select.Option
          key={f.value}
          value={f.value}
          label={f.label}
        >
          {f.label}
        </Select.Option>
      ))}
    </Select>
  );
}
