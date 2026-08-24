declare module '*.css';

declare module '*.mdx' {
  import type React from 'react';
  const MDXComponent: React.ComponentType;
  export default MDXComponent;
}
