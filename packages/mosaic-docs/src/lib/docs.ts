import { docEntries, type DocEntry } from '@/generated/docs';

export type { DocEntry };

export const docKinds = [
  { kind: 'components', title: 'Components' },
  { kind: 'primitives', title: 'Primitives' },
  { kind: 'hooks', title: 'Hooks' },
] as const;

export function docHref(entry: Pick<DocEntry, 'kind' | 'slug'>): string {
  return `/docs/${entry.kind}/${entry.slug}`;
}

export function findDoc(kind: string, slug: string): DocEntry | undefined {
  return docEntries.find(entry => entry.kind === kind && entry.slug === slug);
}

export function findDocByName(name: string): DocEntry | undefined {
  return docEntries.find(entry => entry.doc.name === name);
}

export function docsOfKind(kind: DocEntry['kind']): DocEntry[] {
  return docEntries.filter(entry => entry.kind === kind).sort((a, b) => a.doc.name.localeCompare(b.doc.name));
}

export { docEntries };
