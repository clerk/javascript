// `export {}` makes this file a module so `declare module 'react'` augments React's
// types instead of replacing them (an ambient declaration would shadow React, breaking
// type resolution package-wide).
export {};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    // `inert` landed in @types/react v19; augment for React 18 compatibility.
    // Use 'true' (truthy string) — '' is falsy in React 19 and won't set the attribute.
    inert?: 'true' | undefined;
  }
}
