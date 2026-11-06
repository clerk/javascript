import { PortalProvider } from '@clerk/mosaic';
import { Select } from '@clerk/mosaic/components/select';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './portal.stories?raw';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'Portal',
  source: 'packages/mosaic/src/primitives/portal/portal.tsx',
};

const roles = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'billing', label: 'Billing manager' },
];

export function Default() {
  const container = useRef<HTMLDivElement>(null);
  return (
    <Dialog>
      <DialogTrigger render={<Button variant='outline' />}>Edit member</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>A shadcn dialog. The Mosaic select below opens inside it.</DialogDescription>
        </DialogHeader>
        <div ref={container}>
          <PortalProvider container={container}>
            <Select.Root
              items={roles}
              defaultValue='member'
            >
              <Select.Trigger />
              <Select.Popup />
            </Select.Root>
          </PortalProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
