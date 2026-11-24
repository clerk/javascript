import type { Doc, Example, PartDoc, Practice, PropDocs } from './doc.ts';
import type { TocHeading } from './toc.ts';

export type DocSection =
  | { id: 'usage'; title: 'Usage'; items: string[] }
  | { id: 'parts'; title: 'Parts'; parts: DocPart[] }
  | { id: 'api'; title: 'API reference'; parts: DocPart[] }
  | { id: 'best-practices'; title: 'Best practices'; practices: Practice[] }
  | { id: 'options'; title: 'Options'; props: PropDocs }
  | { id: 'returns'; title: 'Returns'; props: PropDocs }
  | { id: 'examples'; title: 'Examples'; examples: Example[] }
  | { id: 'related'; title: 'Related'; names: string[] };

export type OverviewSection = Exclude<DocSection, { id: 'api' }>;

export interface DocPart extends PartDoc {
  name: string;
  slug: string;
}

export function docSections(doc: Doc): DocSection[] {
  const sections: DocSection[] = [{ id: 'usage', title: 'Usage', items: doc.useFor }];
  if ('parts' in doc) {
    sections.push({ id: 'api', title: 'API reference', parts: docParts(doc.parts) });
  } else {
    if (doc.options && hasProps(doc.options)) {
      sections.push({ id: 'options', title: 'Options', props: doc.options });
    }
    if (hasProps(doc.returns)) {
      sections.push({ id: 'returns', title: 'Returns', props: doc.returns });
    }
  }
  if (doc.practices?.length) {
    sections.push({ id: 'best-practices', title: 'Best practices', practices: doc.practices });
  }
  if (doc.examples?.length) {
    sections.push({ id: 'examples', title: 'Examples', examples: doc.examples });
  }
  if (doc.related?.length) {
    sections.push({ id: 'related', title: 'Related', names: doc.related });
  }
  return sections;
}

export type DocTab = 'overview' | 'properties';

export interface DocTabs {
  part: DocPart;
  defaults: Partial<Record<string, unknown>>;
}

export function docTabs(doc: Doc): DocTabs | undefined {
  const playground = 'parts' in doc ? doc.playground : undefined;
  if (!('parts' in doc) || !playground) {
    return undefined;
  }
  const part = docParts(doc.parts).find(candidate => candidate.name === playground.part);
  return part ? { part, defaults: playground.defaults ?? {} } : undefined;
}

export function overviewSections(doc: Doc): OverviewSection[] {
  return docSections(doc).map(section =>
    section.id === 'api' ? { id: 'parts', title: 'Parts', parts: section.parts } : section,
  );
}

export function overviewHeadings(doc: Doc): TocHeading[] {
  return overviewSections(doc).map(section => ({ depth: 2, slug: section.id, text: section.title }) as const);
}

function docParts(parts: Record<string, PartDoc>): DocPart[] {
  return Object.entries(parts).map(([name, part]) => ({ ...part, name, slug: partSlug(name) }));
}

function hasProps(props: PropDocs): boolean {
  return Object.keys(props).length > 0;
}

export function partSlug(name: string): string {
  return `part-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
