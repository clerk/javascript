import { ClerkInstanceContext, OptionsContext as SharedOptionsContext } from '@clerk/shared/react';
import { useContext, useEffect } from 'react';

import { OptionsContext } from '../contexts/OptionsContext';
import type { Appearance } from '../internal/appearance';
import { warnAboutComponentAppearance } from '../utils/warnAboutCustomizationWithoutPinning';

/**
 * Hook that checks component-level appearance for structural CSS patterns
 * and warns if found (when version is not pinned).
 *
 * This is called when individual components mount with their own appearance,
 * to catch structural CSS that wasn't passed through ClerkProvider.
 *
 * Only runs in development mode.
 *
 * Note: This hook is safe to use outside of ClerkProvider context (e.g., in tests)
 * - it will simply not perform any checks in that case.
 */
export function useWarnAboutCustomizationWithoutPinning(appearance: Appearance | undefined): void {
  // Access contexts directly to handle cases where they might not be available (e.g., in tests)
  const clerkCtx = useContext(ClerkInstanceContext);
  // Try our local OptionsContext first, then fall back to shared (if any)
  const localOptions = useContext(OptionsContext);
  const sharedOptions = useContext(SharedOptionsContext);
  const options = localOptions ?? sharedOptions;

  // Cast to any to access `ui` property which exists on IsomorphicClerkOptions but not ClerkOptions
  // This matches the pattern used in warnAboutCustomizationWithoutPinning
  const uiPinned = !!(options as any)?.ui;

  useEffect(() => {
    // Skip if clerk context is not available (e.g., in tests)
    if (!clerkCtx?.value) {
      return;
    }

    // Only check in development mode
    if (clerkCtx.value.instanceType !== 'development') {
      return;
    }

    // Defer warning check to avoid blocking component mount
    const scheduleWarningCheck =
      typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 0);

    const handle = scheduleWarningCheck(() => {
      warnAboutComponentAppearance(appearance, uiPinned);
    });

    return () => {
      if (typeof cancelIdleCallback === 'function' && typeof handle === 'number') {
        cancelIdleCallback(handle);
      }
    };
  }, [clerkCtx?.value, appearance, uiPinned]);
}
