export interface WriteOptions {
  replace?: boolean;
}

export type SegmentParts = readonly string[];

// A location owns the encoding boundary. The parts it hands out are decoded exactly once, per part,
// as close to the source as the source allows; the parts it is given are encoded on write the same
// way. Nothing above a location encodes or decodes a route part again. `useSegmentParts` returns the
// same array for as long as the segment is unchanged, so callers can memoise on it.
export interface MosaicLocation {
  useSegmentParts: () => SegmentParts;
  write: (parts: SegmentParts, options?: WriteOptions) => void;
}
