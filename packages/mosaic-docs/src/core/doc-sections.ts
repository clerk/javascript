import type { Doc, Example, PartDoc, Practice, PropDocs } from './doc.ts';
import type { TocHeading } from './toc.ts';

export type DocSection =
  | { id: 'use-for'; title: 'Use for'; items: string[] }
  | { id: 'practices'; title: 'Practices'; practices: Practice[] }
  | { id: 'api'; title: 'API reference'; parts: DocPart[] }
  | { id: 'options'; title: 'Options'; props: PropDocs }
  | { id: 'returns'; title: 'Returns'; props: PropDocs }
  | { id: 'examples'; title: 'Examples'; examples: Example[] }
  | { id: 'related'; title: 'Related'; names: string[] };

export interface DocPart extends PartDoc {
  name: string;
  slug: string;
}

export function docSections(doc: Doc): DocSection[] {
  const sections: DocSection[] = [{ id: 'use-for', title: 'Use for', items: doc.useFor }];
  if (doc.practices?.length) {
    sections.push({ id: 'practices', title: 'Practices', practices: doc.practices });
  }
  if ('parts' in doc) {
    sections.push({
      id: 'api',
      title: 'API reference',
      parts: Object.entries(doc.parts).map(([name, part]) => ({ ...part, name, slug: partSlug(name) })),
    });
  } else {
    if (doc.options && hasProps(doc.options)) {
      sections.push({ id: 'options', title: 'Options', props: doc.options });
    }
    if (hasProps(doc.returns)) {
      sections.push({ id: 'returns', title: 'Returns', props: doc.returns });
    }
  }
  if (doc.examples?.length) {
    sections.push({ id: 'examples', title: 'Examples', examples: doc.examples });
  }
  if (doc.related?.length) {
    sections.push({ id: 'related', title: 'Related', names: doc.related });
  }
  return sections;
}

export function docHeadings(doc: Doc): TocHeading[] {
  return docSections(doc).flatMap(section => [
    { depth: 2, slug: section.id, text: section.title } as const,
    ...(section.id === 'api'
      ? section.parts.map(part => ({ depth: 3, slug: part.slug, text: part.name }) as const)
      : []),
  ]);
}

function hasProps(props: PropDocs): boolean {
  return Object.keys(props).length > 0;
}

function partSlug(name: string): string {
  return `part-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
