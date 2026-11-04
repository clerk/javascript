import type { ReactNode } from 'react';

import { ClientRoot } from '@/components/ClientRoot';
import { SwingsetDocument, swingsetMetadata } from '@/components/SwingsetDocument';

export const metadata = swingsetMetadata;

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <SwingsetDocument>
      <ClientRoot>{children}</ClientRoot>
    </SwingsetDocument>
  );
}
