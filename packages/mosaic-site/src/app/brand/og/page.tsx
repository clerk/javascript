import type { Metadata } from 'next';

import { metadata as home } from '@/app/page';

import { OgLab } from './og-lab';

export const metadata: Metadata = { title: 'OG images' };

export default function Page() {
  return (
    <OgLab
      meta={{
        title: typeof home.title === 'string' ? home.title : 'Clerk UI',
        description: home.description ?? '',
        domain: 'mosaic.clerk.com',
      }}
    />
  );
}
