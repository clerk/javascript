/**
 * Re-export all shared types from @clerk/shared/types
 */
export type * from '@clerk/shared/types';

/**
 * Chrome Extension-specific types
 */

// Core types from src/types.ts
export type { Scope, ClerkClientExtensionFeatures } from '../types';

// Storage types
export type { StorageCache } from '../internal/utils/storage';

// Internal Clerk client options
export type { CreateClerkClientOptions } from '../internal/clerk';
