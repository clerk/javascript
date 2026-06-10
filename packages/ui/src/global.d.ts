import type { Clerk } from '@clerk/shared/types';
import type { ClerkUIConstructor } from '@clerk/shared/ui';

declare module 'react' {
  interface HTMLAttributes<T> {
    // `inert` landed in @types/react v19; augment for React 18 compatibility.
    // Use 'true' (truthy string) — '' is falsy in React 19 and won't set the attribute.
    inert?: 'true' | undefined;
  }
}

declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

declare global {
  // New rspack build constants
  declare const __DEV__: boolean;
  declare const PACKAGE_NAME: string;
  declare const PACKAGE_VERSION: string;
  declare const __BUILD_DISABLE_RHC__: string;
  interface Window {
    Clerk?: Clerk & { __internal_last_error?: any };

    /**
     * Unstable API for accessing UI components separately from clerk-js.
     * This is injected by the @clerk/ui browser bundle.
     */
    __internal_ClerkUICtor?: ClerkUIConstructor;
  }
}
