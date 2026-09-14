import type { PaginationProps } from '@clerk/ui/mosaic/components/pagination';
import { Pagination } from '@clerk/ui/mosaic/components/pagination';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './pagination.stories?raw';

// StyleX has no runtime recipe to derive knobs from, so the variant surface is described
// here to drive the playground + prop table. Keys mirror `PaginationProps`.
export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  substatus: 'needs design',
  title: 'Pagination',
  source: 'packages/ui/src/mosaic/components/pagination/pagination.tsx',
  styles: {
    _variants: {
      size: { sm: {}, md: {}, lg: {} },
      hasFirstLast: { true: {}, false: {} },
      disabled: { true: {}, false: {} },
    },
    _defaultVariants: {
      size: 'md',
      hasFirstLast: false,
      disabled: false,
    },
  },
};

// Story functions accept Record<string,unknown> (knob values) and cast to PaginationProps.
// The cast is unavoidable: knobs are dynamically typed; Pagination has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as Partial<PaginationProps>;
}

export function Primary(props: Record<string, unknown>) {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      page={page}
      totalItems={100}
      pageSize={10}
      onChange={setPage}
      {...knobsAsProps(props)}
    />
  );
}

export function Sizes(props: Record<string, unknown>) {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Pagination
          key={size}
          {...knobsAsProps(props)}
          page={page}
          totalItems={100}
          pageSize={10}
          onChange={setPage}
          size={size}
        />
      ))}
    </div>
  );
}

export function FirstLast(props: Record<string, unknown>) {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      {...knobsAsProps(props)}
      page={page}
      totalItems={250}
      pageSize={10}
      onChange={setPage}
      hasFirstLast
    />
  );
}

export function Siblings(props: Record<string, unknown>) {
  const [page, setPage] = useState(10);
  return (
    <Pagination
      {...knobsAsProps(props)}
      page={page}
      totalItems={200}
      pageSize={10}
      onChange={setPage}
      siblingCount={2}
    />
  );
}

export function SinglePage(props: Record<string, unknown>) {
  return (
    <Pagination
      {...knobsAsProps(props)}
      page={1}
      totalItems={8}
      pageSize={10}
    />
  );
}

export function Disabled(props: Record<string, unknown>) {
  return (
    <Pagination
      {...knobsAsProps(props)}
      page={4}
      totalItems={100}
      pageSize={10}
      disabled
    />
  );
}
