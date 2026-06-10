declare module 'react' {
  interface HTMLAttributes<T> {
    // `inert` landed in @types/react v19; augment for React 18 compatibility.
    // Use 'true' (truthy string) — '' is falsy in React 19 and won't set the attribute.
    inert?: 'true' | undefined;
  }
}
