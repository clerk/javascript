/**
 * Augments the global ClerkAppearanceRegistry with the Theme type from @clerk/ui.
 * This provides full type safety for appearance props in @clerk/react without creating circular dependencies.
 */
import type { Theme } from '@clerk/ui/internal';

declare global {
  interface ClerkAppearanceRegistry {
    theme: Theme;
  }
}
