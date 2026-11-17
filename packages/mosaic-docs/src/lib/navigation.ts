import { docHref, docKinds, docsOfKind } from '@/lib/docs';

export interface NavItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface TocHeading {
  depth: 2 | 3;
  slug: string;
  text: string;
}

export const navigation: NavGroup[] = [
  {
    title: 'Get started',
    items: [{ title: 'Introduction', href: '/docs' }],
  },
  ...docKinds.map(({ kind, title }) => ({
    title,
    items: docsOfKind(kind).map(entry => ({ title: entry.doc.name, href: docHref(entry) })),
  })),
];
