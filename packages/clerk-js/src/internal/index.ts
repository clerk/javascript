import type { BrowserClerkConstructor } from '@clerk/shared/types';

declare const Tags: unique symbol;
type Tagged<BaseType, Tag extends PropertyKey> = BaseType & { [Tags]: { [K in Tag]: void } };

/**
 * Runtime brand value to identify valid JS objects
 */
export const JS_BRAND = '__clerkJS' as const;

/**
 * Js type that carries type information via phantom property
 * Tagged to ensure only official js objects from @clerk/clerk-js can be used
 *
 * ClerkJS is optional to support server-safe marker exports (react-server condition).
 * When ClerkJS is absent, the SDK will dynamically import it.
 */
export type Js = Tagged<
  {
    /**
     * Runtime brand to identify valid JS objects
     */
    __brand: typeof JS_BRAND;
    /**
     * ClerkJS constructor. Optional to support server-safe marker exports.
     * When absent (e.g., in React Server Components), the SDK resolves it via dynamic import.
     */
    ClerkJS?: BrowserClerkConstructor;
    /**
     * Version of the JS package (for potential future use)
     */
    version?: string;
  },
  'ClerkJS'
>;
