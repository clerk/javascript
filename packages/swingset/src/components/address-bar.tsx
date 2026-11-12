'use client';

import { useAddressBar } from '@/lib/use-address-bar';

export function AddressBar() {
  const addressBar = useAddressBar();
  return (
    <p className='text-muted-foreground text-sm'>
      URL: <code className='text-foreground break-all font-mono text-xs'>{addressBar ?? '…'}</code>
    </p>
  );
}
