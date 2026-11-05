import type { Metadata } from 'next';

import { HeroGraphiteSubtle } from '@/components/marketing/hero-graphite-subtle';
export const metadata: Metadata = {
  title: 'Hero · subtle mosaic · Mosaic Lab',
  description:
    'A quiet take on the graphite hero: near-white tiles in light mode, near-black in dark mode, with a side panel to tune it.',
};
export default function Page() {
  return <HeroGraphiteSubtle />;
}
