import type { Metadata } from 'next';

import { DocsPage } from '@/components/docs-page';
import type { TocHeading } from '@/lib/navigation';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Introduction',
  alternates: { types: { 'text/markdown': '/docs.md' } },
};

const headings: TocHeading[] = [
  { depth: 2, slug: 'components', text: 'Components' },
  { depth: 2, slug: 'primitives', text: 'Primitives' },
  { depth: 2, slug: 'hooks', text: 'Hooks' },
];

export default function IntroductionPage() {
  return (
    <DocsPage
      headings={headings}
      markdownHref='/docs.md'
    >
      <h1>Introduction</h1>
      <p className='lead'>{site.description}</p>
      <h2 id='components'>Components</h2>
      <p>Styled, ready-to-use building blocks.</p>
      <h2 id='primitives'>Primitives</h2>
      <p>Headless building blocks that components are made from.</p>
      <h2 id='hooks'>Hooks</h2>
      <p>React hooks for behavior shared across components.</p>
    </DocsPage>
  );
}
