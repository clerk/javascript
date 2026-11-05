import type { Metadata } from 'next';

import { DocsShell } from '@/components/marketing/docs-shell';
import { FeaturedComponents } from '@/components/marketing/featured-components';
import { Hero } from '@/components/marketing/hero';
import { ClosingCta, Principles, SiteFooter } from '@/components/marketing/sections';
export const metadata: Metadata = {
  title: 'Mosaic Components — Identity without limits',
  description:
    'Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and replaced.',
};
export default function Page() {
  return (
    <DocsShell title='Overview'>
      <main>
        <Hero />
        <Principles />
        <FeaturedComponents />
        <ClosingCta />
      </main>
      <SiteFooter />
    </DocsShell>
  );
}
