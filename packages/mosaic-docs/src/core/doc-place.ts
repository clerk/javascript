export interface DocPlace {
  kind: 'components' | 'primitives' | 'hooks';
  slug: string;
}

export function placeDoc(place: DocPlace, doc: { name: string; parts?: unknown }): DocPlace {
  if ('parts' in doc) {
    return place;
  }
  return { kind: 'hooks', slug: doc.name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) };
}
