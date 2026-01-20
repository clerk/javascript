---
'@clerk/tanstack-react-start': minor
'@clerk/react-router': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/astro': minor
'@clerk/react': minor
'@clerk/expo': minor
'@clerk/nuxt': minor
'@clerk/vue': minor
'@clerk/ui': minor
---

Introduce `<UNSAFE_PortalProvider>` component which allows you to specify a custom container for Clerk floating UI elements (popovers, modals, tooltips, etc.) that use portals. Only Clerk components within the provider will be affected, components outside the provider will continue to use the default document.body for portals.

This is particularly useful when using Clerk components inside external UI libraries like [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) or [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html), where portaled elements need to render within the dialog's container to remain interact-able.

```tsx
'use client';

import { useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UNSAFE_PortalProvider, UserButton } from '@clerk/nextjs';

export function UserDialog() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content ref={containerRef}>
          <UNSAFE_PortalProvider getContainer={() => containerRef.current}>
            <UserButton />
          </UNSAFE_PortalProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```
