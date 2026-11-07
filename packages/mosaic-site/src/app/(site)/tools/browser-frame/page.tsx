import type { Metadata } from 'next';

import { BrowserFrameTool } from '@/components/marketing/browser-frame';
export const metadata: Metadata = {
  title: 'Browser frame · Mosaic Lab',
  description: 'A minimal browser outline around any Mosaic component.',
};
export default function Page() {
  return <BrowserFrameTool />;
}
