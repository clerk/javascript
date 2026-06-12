import type { SxProp } from './cva';

/** A component prop set augmented with mosaic's `sx` override prop. */
export type Mosaic<T> = T & { sx?: SxProp };
