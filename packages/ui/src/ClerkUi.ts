import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/shared/types';
import type { ClerkUiInstance, ComponentControls as SharedComponentControls } from '@clerk/shared/ui';

import { type MountComponentRenderer, mountComponentRenderer } from './Components';

export class ClerkUi implements ClerkUiInstance {
  static version = __PKG_VERSION__;
  version = __PKG_VERSION__;

  #componentRenderer: ReturnType<MountComponentRenderer>;

  constructor(
    getClerk: () => Clerk,
    getEnvironment: () => EnvironmentResource | null | undefined,
    options: ClerkOptions,
    _importModule: (module: string) => Promise<any>,
  ) {
    this.#componentRenderer = mountComponentRenderer(getClerk, getEnvironment, options);
  }

  ensureMounted(opts?: { preloadHint?: string }): Promise<SharedComponentControls> {
    return this.#componentRenderer.ensureMounted(opts as unknown as any) as Promise<SharedComponentControls>;
  }
}
