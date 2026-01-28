/**
 * Branded/Tagged type utilities for creating nominal types.
 * These are used to ensure only official Clerk objects can be passed to certain props.
 */

declare const Tags: unique symbol;

/**
 * Creates a branded/tagged type that prevents arbitrary objects from being assigned.
 * The tag exists only at the type level and has no runtime overhead.
 *
 * @example
 * ```typescript
 * type UserId = Tagged<string, 'UserId'>;
 * const userId: UserId = 'user_123' as UserId;
 * ```
 */
export type Tagged<BaseType, Tag extends PropertyKey> = BaseType & { [Tags]: { [K in Tag]: void } };

/**
 * Branded type for Clerk JS version pinning objects.
 * Used with the `clerkJs` prop in ClerkProvider.
 *
 * @example
 * ```typescript
 * import { clerkJs } from '@clerk/clerk-js-pinned';
 * <ClerkProvider clerkJs={clerkJs} />
 * ```
 */
export type ClerkJs = Tagged<
  {
    /**
     * The version string of @clerk/clerk-js to load from CDN.
     */
    version: string;
  },
  'ClerkJs'
>;

/**
 * Branded type for Clerk UI version pinning objects.
 * Carries appearance type information via phantom property for type-safe customization.
 *
 * @example
 * ```typescript
 * import { ui } from '@clerk/ui-pinned';
 * <ClerkProvider ui={ui} appearance={{ ... }} />
 * ```
 */
export type Ui<A = any> = Tagged<
  {
    /**
     * The version string of @clerk/ui to load from CDN.
     */
    version: string;
    /**
     * Optional custom URL to load @clerk/ui from.
     */
    url?: string;
    /**
     * Phantom property for type-level appearance inference.
     * This property never exists at runtime.
     * @internal
     */
    __appearanceType?: A;
  },
  'ClerkUi'
>;

/**
 * Extracts the appearance type from a Ui object. We have 3 cases:
 * - If the Ui type has __appearanceType with a specific type, extract it
 * - If __appearanceType is 'any', fallback to base Appearance type
 * - Otherwise, fallback to the base Appearance type
 */
export type ExtractAppearanceType<T, Default> = T extends { __appearanceType?: infer A }
  ? 0 extends 1 & A // Check if A is 'any' (this trick works because 1 & any = any, and 0 extends any)
    ? Default
    : A
  : Default;
