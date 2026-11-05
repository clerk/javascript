import type { Metadata } from 'next';

import { Gallery } from '@/components/gallery/gallery';
import { DocsShell } from '@/components/marketing/docs-shell';
export const metadata: Metadata = {
  title: 'Components · Mosaic Components',
  description: 'Browse the Mosaic components and open any of them in a live preview.',
};
export default function ComponentsPage() {
  return (
    <DocsShell title='Components'>
      <Gallery />
    </DocsShell>
  );
}
