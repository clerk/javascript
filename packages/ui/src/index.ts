import type { Ui } from './internal';
import type { Appearance } from './internal/appearance';

declare const PACKAGE_VERSION: string;

/**
 * Default ui object for Clerk UI components
 * Tagged with the internal Appearance type for type-safe appearance prop inference
 */
export const ui = {
  version: PACKAGE_VERSION,
} as Ui<Appearance>;
