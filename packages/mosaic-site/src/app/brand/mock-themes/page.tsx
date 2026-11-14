import type { Metadata } from 'next';

import { ThemeLab } from './theme-lab';

export const metadata: Metadata = { title: 'Mock themes · Brand' };

export default function Page() {
  return (
    <main>
      <ThemeLab />
    </main>
  );
}
