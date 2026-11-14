import type { Metadata } from 'next';

import { MobileLab } from '@/components/marketing/mobile-lab';

export const metadata: Metadata = { title: 'Home hero mobile · Brand' };

export default function Page() {
  return <MobileLab />;
}
