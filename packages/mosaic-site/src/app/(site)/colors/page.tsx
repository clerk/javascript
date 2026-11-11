import type { Metadata } from 'next';

import { ColorLab } from '@/components/marketing/color-lab';
export const metadata: Metadata = {
  title: 'Colors · Clerk UI',
  description: 'The Mosaic palette: mostly ink and white, a little grey, one moment of violet.',
};
export default function Page() {
  return (
    <main>
      <ColorLab />
    </main>
  );
}
