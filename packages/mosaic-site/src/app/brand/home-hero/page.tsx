import type { Metadata } from 'next';

import { HeroQuilt } from '@/components/marketing/hero-quilt';
import { MosaicScene } from '@/components/marketing/mosaic-scene';

export const metadata: Metadata = { title: 'Home hero · Brand' };

export default function Page() {
  return (
    <main className='relative isolate overflow-x-clip'>
      <HeroQuilt scene={<MosaicScene />} />
    </main>
  );
}
