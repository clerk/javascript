import type { ReactNode } from 'react';

import { ClientRoot } from '@/components/ClientRoot';

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return <ClientRoot>{children}</ClientRoot>;
}
