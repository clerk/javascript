import type {} from 'react';

declare module 'react' {
  // Mosaic is themed through `--cl-*` custom properties, which stories set inline.
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
