import type { ModuleManager } from '../moduleManager';
import type { Clerk, ClerkOptions, EnvironmentResource } from '../types';

// TODO @nikos
export type Appearance = any;

export type UIVersion = string;

export type ComponentControls = {
  mountComponent: (params: { appearanceKey: string; name: string; node: HTMLDivElement; props?: any }) => void;
  unmountComponent: (params: { node: HTMLDivElement }) => void;
  updateProps: (params: {
    appearance?: Appearance | undefined;
    options?: ClerkOptions | undefined;
    node?: HTMLDivElement;
    props?: unknown;
  }) => void;
  openModal: (modal: string, props?: any) => void;
  closeModal: (modal: string, options?: { notify?: boolean }) => void;
  openDrawer: (drawer: string, props?: any) => void;
  closeDrawer: (drawer: string, options?: { notify?: boolean }) => void;
  prefetch: (component: 'organizationSwitcher') => void;
  mountImpersonationFab: () => void;
};

// Instance shape that the class will implement
export interface ClerkUIInstance {
  version: string;
  ensureMounted: (opts?: { preloadHint?: string }) => Promise<ComponentControls>;
}

// Constructor type
export interface ClerkUIConstructor {
  new (
    getClerk: () => Clerk,
    getEnvironment: () => EnvironmentResource | null | undefined,
    options: ClerkOptions,
    moduleManager: ModuleManager,
  ): ClerkUIInstance;
  version: string;
}

export type ClerkUI = ClerkUIInstance;
