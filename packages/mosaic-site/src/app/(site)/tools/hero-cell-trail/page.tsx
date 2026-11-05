import type { Metadata } from 'next';

import { HeroLightGrid } from '@/components/marketing/hero-light-grid';
export const metadata: Metadata = {
  title: 'Hero · light grid · Mosaic Lab',
  description: 'A hero on a light grid with a subtle cell trail.',
};
export default function Page() {
  return <HeroLightGrid />;
}
