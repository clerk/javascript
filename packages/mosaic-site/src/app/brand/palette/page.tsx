import type { Metadata } from 'next';

import { PaletteLab } from './palette-lab';

export const metadata: Metadata = { title: 'Palette · Brand' };

export default function Page() {
  return (
    <main>
      <PaletteLab />
    </main>
  );
}
