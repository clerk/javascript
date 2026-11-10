import type { Metadata } from 'next';

import { ColorLab } from '@/components/marketing/color-lab';
import { DocsShell } from '@/components/marketing/docs-shell';
export const metadata: Metadata = {
  title: 'Colors · Clerk Components',
  description: 'The Mosaic palette: mostly ink and white, a little grey, one moment of violet.',
};
export default function Page() {
  return (
    <DocsShell title='Colors'>
      <main>
        <ColorLab />
      </main>
    </DocsShell>
  );
}
