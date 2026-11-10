import type { Metadata } from 'next';

import { DocsShell } from '@/components/marketing/docs-shell';
import { HeroQuilt } from '@/components/marketing/hero-quilt';
import { OverviewSections } from '@/components/marketing/overview';
export const metadata: Metadata = {
  title: 'Clerk Components — Mosaic',
  description:
    'Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and replaced.',
};
export default function Page() {
  return (
    <DocsShell title='Overview'>
      <main className='relative isolate overflow-x-clip'>
        <HeroQuilt />
        <OverviewSections />
      </main>
    </DocsShell>
  );
}
