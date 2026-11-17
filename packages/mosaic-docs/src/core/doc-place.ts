import type { Doc } from './doc.ts';

export interface DocPlace {
  kind: 'components' | 'primitives' | 'hooks';
  slug: string;
}

export function placeDocs<Entry extends DocPlace & { doc: Doc }>(entries: Entry[]): Entry[] {
  const seen = new Set<string>();
  return entries.map(entry => {
    const placed = { ...entry, ...placeOf(entry, entry.doc) };
    const key = `${placed.kind}/${placed.slug}`;
    if (seen.has(key)) {
      throw new Error(`Two docs share ${key}`);
    }
    seen.add(key);
    return placed;
  });
}

function placeOf(place: DocPlace, doc: Doc): DocPlace {
  if ('parts' in doc) {
    return { kind: place.kind, slug: place.slug };
  }
  return { kind: 'hooks', slug: doc.name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) };
}
