import type { Metadata } from 'next';

import { BakedMosaic, MOSAIC_SKELETON_URL, MosaicSkeleton } from '@/components/marketing/baked-mosaic';
import { HeroQuilt } from '@/components/marketing/hero-quilt';
import { HomeHeader } from '@/components/marketing/home-header';
import { OverviewSections } from '@/components/marketing/overview';
import { SiteFooter } from '@/components/marketing/site-footer';
export const metadata: Metadata = {
  title: 'Clerk UI · Production-ready components built for agents',
  description:
    'Sign-in, profiles, consent, and agent experiences. Composable components you can rearrange, restyle, and replace.',
};
export default function Page() {
  return (
    <main className='relative isolate overflow-x-clip'>
      <link
        rel='preload'
        as='image'
        href={MOSAIC_SKELETON_URL}
        fetchPriority='high'
      />
      <HomeHeader />
      <HeroQuilt
        scene={<BakedMosaic />}
        anchor={<MosaicSkeleton />}
      />
      <OverviewSections />
      <SiteFooter />
    </main>
  );
}
