import type { Metadata } from 'next';

import { LabHome } from '@/components/marketing/lab-home';
export const metadata: Metadata = {
  title: 'Mosaic Lab',
  description: 'Brand concept tools for the mosaic idea.',
};
export default function Page() {
  return <LabHome />;
}
