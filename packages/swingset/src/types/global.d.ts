/// <reference types="@emotion/react/types/css-prop" />

declare module '*.css';

declare module '*.jpg' {
  const image: { src: string; height: number; width: number; blurDataURL?: string };
  export default image;
}

declare module '*.png' {
  const image: { src: string; height: number; width: number; blurDataURL?: string };
  export default image;
}

declare module '*.mdx' {
  import type React from 'react';
  const MDXComponent: React.ComponentType;
  export default MDXComponent;
}
