import type { Doc } from './doc.ts';
import type { DocPlace } from './doc-place.ts';
import { partSlug } from './doc-sections.ts';

export interface RelatedPlace {
  place: DocPlace;
  anchor?: string;
}

export function findRelated(entries: (DocPlace & { doc: Doc })[], name: string): RelatedPlace | undefined {
  const page = entries.find(entry => entry.doc.name === name);
  if (page) {
    return { place: { kind: page.kind, slug: page.slug } };
  }
  const owner = entries.find(entry => 'parts' in entry.doc && name in entry.doc.parts);
  if (owner) {
    return { place: { kind: owner.kind, slug: owner.slug }, anchor: partSlug(name) };
  }
  return undefined;
}
