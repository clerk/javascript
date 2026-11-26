export interface WriteOptions {
  replace?: boolean;
}

export type SegmentParts = readonly string[];

// A scope's handle on its segment: its base and the parts under it, in whatever carries the page's
// routing state. It also owns the encoding boundary. The parts it hands out are decoded exactly once, per part, as
// close to the source as the source allows; the parts it is given are encoded on write the same way,
// where the codec has an encoded form at all. Nothing above a location encodes or decodes a route
// part again.
//
// `useSegmentParts` returns the same array for as long as the segment is unchanged, so callers can
// memoise on it, and `undefined` while there is no segment at all: a modal reads that as closed, a
// router scope as the root. `clear` removes the segment, for a modal host closing its modal. `own`
// counts a mounted owner in, and the function it returns counts it out again; a segment outlives its
// last owner no more than a pathname outlives the host leaving the route.
export interface MosaicLocation {
  useSegmentParts: () => SegmentParts | undefined;
  write: (parts: SegmentParts, options?: WriteOptions) => void;
  clear: () => void;
  own: () => () => void;
}
