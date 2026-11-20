import { docHref, docKinds, docsOfKind } from '@/lib/docs';
import type { NavGroup } from '@/ui/docs-nav';

export const navigation: NavGroup[] = [
  {
    title: 'Get started',
    items: [{ title: 'Setup', href: '/docs/setup' }],
  },
  ...docKinds.map(({ kind, title }) => ({
    title,
    items: docsOfKind(kind).map(entry => ({ title: entry.doc.name, href: docHref(entry) })),
  })),
];
