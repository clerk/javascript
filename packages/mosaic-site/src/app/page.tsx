import type { Metadata } from 'next';

import {
  BakedMosaic,
  MOSAIC_SKELETON_MOBILE_URL,
  MOSAIC_SKELETON_URL,
  MosaicSkeleton,
} from '@/components/marketing/baked-mosaic';
import { HeroQuilt } from '@/components/marketing/hero-quilt';
import { HomeHeader } from '@/components/marketing/home-header';
import { OverviewSections } from '@/components/marketing/overview';
import { SiteFooter } from '@/components/marketing/site-footer';
const TITLE = "Clerk UI · Prebuilt auth UI that doesn't box you in";
const DESCRIPTION =
  'Sign-in, account, and organization screens on Clerk. Change the layout, styles, or fields yourself, or ask your agent.';
const OG_IMAGE = { url: '/og/og.png?v=3b4ee2fa', width: 1200, height: 630, alt: 'Clerk UI' };

export const metadata: Metadata = {
  title: 'Clerk UI',
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Clerk UI',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    videos: [{ url: 'https://mosaic.clerk.com/og/video.mp4?v=a43fc636', width: 1280, height: 720, type: 'video/mp4' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};
export default function Page() {
  return (
    <>
      <HomeHeader />
      <main className='relative isolate overflow-x-clip'>
        <link
          rel='preload'
          as='image'
          href={MOSAIC_SKELETON_URL}
          media='(min-width: 640px)'
          fetchPriority='high'
        />
        <link
          rel='preload'
          as='image'
          href={MOSAIC_SKELETON_MOBILE_URL}
          media='(max-width: 639px)'
          fetchPriority='high'
        />
        <HeroQuilt
          scene={<BakedMosaic />}
          anchor={<MosaicSkeleton />}
        />
        <OverviewSections />
      </main>
      <SiteFooter />
    </>
  );
}
