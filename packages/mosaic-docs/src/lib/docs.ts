import { placeDocs } from '@/core/doc-place';
import { findRelated } from '@/core/doc-related';
import { docEntries as generatedEntries, type DocEntry } from '@/generated/docs';
import { site } from '@/lib/site';

export type { DocEntry };

export const docEntries: DocEntry[] = placeDocs(generatedEntries);

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

export function relatedHref(name: string): string | undefined {
  const related = findRelated(docEntries, name);
  if (!related) {
    return undefined;
  }
  return related.anchor ? `${docHref(related.place)}#${related.anchor}` : docHref(related.place);
}

export function relatedMarkdownHref(name: string): string | undefined {
  const related = findRelated(docEntries, name);
  return related ? `${site.url}${docHref(related.place)}.md` : undefined;
}

export function docsOfKind(kind: DocEntry['kind']): DocEntry[] {
  return docEntries.filter(entry => entry.kind === kind).sort((a, b) => a.doc.name.localeCompare(b.doc.name));
}
