import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/ui/container';

export const metadata: Metadata = { title: 'Brand' };

const PAGES = [
  { href: '/brand/home-hero', title: 'Home hero', description: 'Tune the home page mosaic scene and bake its assets.' },
  { href: '/brand/palette', title: 'Palette', description: 'Tune the site grays, surfaces and accent colors.' },
  { href: '/brand/type', title: 'Type', description: 'Preview the site type roles.' },
  { href: '/brand/mock-themes', title: 'Mock themes', description: 'Preview the themes used by the component mocks.' },
];

export default function Page() {
  return (
    <main className='py-16'>
      <Container>
        <h1 className='heading-3'>Brand</h1>
        <p className='body-2 mt-2 text-gray-500 dark:text-gray-400'>Internal tools for designing the Mosaic site.</p>
        <ul className='mt-10 flex flex-col gap-6'>
          {PAGES.map(page => (
            <li key={page.href}>
              <Link
                href={page.href}
                className='label-2 text-foreground underline-offset-4 hover:underline'
              >
                {page.title}
              </Link>
              <p className='body-3 mt-1 text-gray-500 dark:text-gray-400'>{page.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
