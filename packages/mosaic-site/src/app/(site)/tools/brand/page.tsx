import type { Metadata } from 'next';

import { BrandOverview } from '@/components/marketing/brand/brand-overview';
export const metadata: Metadata = {
  title: 'Brand overview · Mosaic Lab',
  description: 'The logo, colour, type, concept, voice and motion of Mosaic Components.',
};
export default function Page() {
  return <BrandOverview />;
}
