import type { Doc } from './doc.ts';
import type { DocPlace } from './doc-place.ts';
import { type DocTab, partSlug } from './doc-sections.ts';

export interface RelatedPlace {
  place: DocPlace;
  anchor?: string;
  tab?: DocTab;
}

export function findRelated(entries: (DocPlace & { doc: Doc })[], name: string): RelatedPlace | undefined {
  const page = entries.find(entry => entry.doc.name === name);
  if (page) {
    return { place: { kind: page.kind, slug: page.slug } };
  }
  const owner = entries.find(entry => 'parts' in entry.doc && name in entry.doc.parts);
  if (owner) {
    const place = { kind: owner.kind, slug: owner.slug };
    return 'parts' in owner.doc && owner.doc.playground?.part === name
      ? { place, anchor: partSlug(name), tab: 'properties' }
      : { place, anchor: partSlug(name) };
  }
  return undefined;
}

export function hideRelated<D extends Doc>(doc: D, names: ReadonlySet<string>): D {
  return doc.related ? { ...doc, related: doc.related.filter(name => !names.has(name)) } : doc;
}
