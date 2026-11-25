import { placeDocs } from '@/core/doc-place';
import { findRelated, hideRelated } from '@/core/doc-related';
import { docEntries as generatedEntries, type DocEntry } from '@/generated/docs';
import { site } from '@/lib/site';

export type { DocEntry };

const siteEntries = placeDocs(generatedEntries).filter(entry => entry.kind !== 'hooks');
const unpublished = new Set(
  siteEntries.flatMap(entry => entry.doc.related ?? []).filter(name => !findRelated(siteEntries, name)),
);

export const docEntries: DocEntry[] = siteEntries.map(entry => ({
  ...entry,
  doc: hideRelated(entry.doc, unpublished),
}));

export const docKinds = [
  { kind: 'components', title: 'Components' },
  { kind: 'primitives', title: 'Primitives' },
] as const;

export function docHref(entry: Pick<DocEntry, 'kind' | 'slug'>): string {
  return `/docs/${entry.kind}/${entry.slug}`;
}

export function findDoc(kind: string, slug: string): DocEntry | undefined {
  return docEntries.find(entry => entry.kind === kind && entry.slug === slug);
}

export function relatedHref(name: string): string | undefined {
  const related = findRelated(docEntries, name);
  if (!related) {
    return undefined;
  }
  const page = related.tab === 'properties' ? `${docHref(related.place)}/properties` : docHref(related.place);
  return related.anchor ? `${page}#${related.anchor}` : page;
}

export function relatedMarkdownHref(name: string): string | undefined {
  const related = findRelated(docEntries, name);
  return related ? `${site.url}${docHref(related.place)}.md` : undefined;
}

export function docsOfKind(kind: DocEntry['kind']): DocEntry[] {
  return docEntries.filter(entry => entry.kind === kind).sort((a, b) => a.doc.name.localeCompare(b.doc.name));
}
