/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Popover } from '@clerk/ui/mosaic/components/popover';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './popover.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Popover',
  source: 'packages/ui/src/mosaic/components/popover/popover.tsx',
};

const popoverTrigger = (props: React.HTMLAttributes<HTMLElement>) => <Button {...props}>Open popover</Button>;

export function Default() {
  return (
    <Popover trigger={popoverTrigger}>
      <Popover.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong>Ada Lovelace</strong>
          <span style={{ color: 'var(--cl-color-muted-foreground)' }}>ada@example.com</span>
        </div>
      </Popover.Content>
      <Popover.Footer>
        <Button
          intent='destructive'
          fullWidth
        >
          Sign out of all accounts
        </Button>
      </Popover.Footer>
    </Popover>
  );
}
