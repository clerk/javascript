import { ClerkRuntimeError } from '@clerk/shared/error';
import { logger } from '@clerk/shared/logger';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/shared/types';
import type { ClerkUIInstance, ComponentControls as SharedComponentControls } from '@clerk/shared/ui';
import { isVersionAtLeast, parseVersion } from '@clerk/shared/versionCheck';

import { type MountComponentRenderer, mountComponentRenderer } from './Components';
import { MIN_CLERK_JS_VERSION } from './constants';

export class ClerkUI implements ClerkUIInstance {
  static version = PACKAGE_VERSION;
  version = PACKAGE_VERSION;

  #componentRenderer: ReturnType<MountComponentRenderer>;

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

  ensureMounted(opts?: { preloadHint?: string }): Promise<SharedComponentControls> {
    return this.#componentRenderer.ensureMounted(opts as unknown as any) as Promise<SharedComponentControls>;
  }
}
