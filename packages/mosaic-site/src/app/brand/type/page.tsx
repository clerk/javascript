import type { Metadata } from 'next';

import { TypeLab } from './type-lab';

export const metadata: Metadata = { title: 'Type · Brand' };

export default function Page() {
  return (
    <main>
      <TypeLab />
    </main>
  );
}
