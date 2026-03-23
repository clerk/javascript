'use client';

import { ClerkRuntimeError } from '@clerk/shared/error';
import { logger } from '@clerk/shared/logger';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/shared/types';
import type { ClerkUIInstance, ComponentControls as SharedComponentControls } from '@clerk/shared/ui';
import { isVersionAtLeast, parseVersion } from '@clerk/shared/versionCheck';

import { type MountComponentRenderer, mountComponentRenderer } from './Components';
import { MIN_CLERK_JS_VERSION } from './constants';

/**
 * Core rendering engine for Clerk's prebuilt UI components.
 *
 * `ClerkUI` bootstraps the component renderer that powers Clerk's drop-in
 * authentication and user-management components (`<SignIn />`, `<UserButton />`,
 * etc.). It is created internally by Clerk SDKs when the `ui` prop is passed to
 * `ClerkProvider` and should not be instantiated directly by application code.
 *
 * This module is marked `'use client'` so that React Server Components can
 * serialize `ClerkUI` as a client reference rather than attempting to serialize
 * the class itself.
 *
 * @public
 */
export class ClerkUI implements ClerkUIInstance {
  static version = PACKAGE_VERSION;
  version = PACKAGE_VERSION;

  #componentRenderer: ReturnType<MountComponentRenderer>;

  /**
   * Creates a new `ClerkUI` instance and mounts the internal component renderer.
   *
   * Validates that the active `@clerk/clerk-js` version satisfies the minimum
   * required version ({@link MIN_CLERK_JS_VERSION}). In development instances a
   * mismatch throws a {@link ClerkRuntimeError}; in production it logs a warning.
   *
   * @param getClerk - Accessor that returns the active {@link Clerk} instance.
   * @param getEnvironment - Accessor that returns the current {@link EnvironmentResource}, or `null`/`undefined` if not yet loaded.
   * @param options - Global {@link ClerkOptions} forwarded to the component renderer.
   * @param moduleManager - The SDK's {@link ModuleManager} used for module resolution and lazy loading.
   * @throws {ClerkRuntimeError} When running in a development instance with an incompatible `@clerk/clerk-js` version.
   *
   * @internal
   */
  constructor(
    getClerk: () => Clerk,
    getEnvironment: () => EnvironmentResource | null | undefined,
    options: ClerkOptions,
    moduleManager: ModuleManager,
  ) {
    const clerk = getClerk();
    const clerkVersion = clerk?.version;
    const isDevelopmentInstance = clerk?.instanceType === 'development';
    const parsedVersion = parseVersion(clerkVersion ?? '');

    let incompatibilityMessage: string | null = null;

    if (parsedVersion && !isVersionAtLeast(clerkVersion, MIN_CLERK_JS_VERSION)) {
      incompatibilityMessage =
        `@clerk/ui@${ClerkUI.version} requires @clerk/clerk-js@>=${MIN_CLERK_JS_VERSION}, ` +
        `but found @clerk/clerk-js@${clerkVersion}. ` +
        `Please upgrade @clerk/clerk-js (or your framework SDK) to a compatible version.`;
    } else if (!parsedVersion && !moduleManager) {
      incompatibilityMessage =
        `@clerk/ui@${ClerkUI.version} requires @clerk/clerk-js@>=${MIN_CLERK_JS_VERSION}, ` +
        `but found an incompatible version${clerkVersion ? ` (${clerkVersion})` : ''}. ` +
        `Please upgrade @clerk/clerk-js (or your framework SDK) to a compatible version.`;
    }

    if (incompatibilityMessage) {
      if (isDevelopmentInstance) {
        throw new ClerkRuntimeError(incompatibilityMessage, { code: 'clerk_ui_version_mismatch' });
      } else {
        logger.warnOnce(incompatibilityMessage);
      }
    }

    this.#componentRenderer = mountComponentRenderer(getClerk, getEnvironment, options, moduleManager);
  }

  /**
   * Ensures the UI component renderer is mounted and ready.
   *
   * Returns a promise that resolves with {@link ComponentControls} once the
   * renderer is fully initialised. Subsequent calls return the same promise.
   *
   * @param opts - Optional hints for the renderer.
   * @param opts.preloadHint - An optional component name to preload assets for (e.g. `"SignIn"`).
   * @returns A promise resolving to {@link ComponentControls} for mounting, unmounting, and updating components.
   *
   * @public
   */
  ensureMounted(opts?: { preloadHint?: string }): Promise<SharedComponentControls> {
    return this.#componentRenderer.ensureMounted(opts as unknown as any) as Promise<SharedComponentControls>;
  }
}
