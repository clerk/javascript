import type { ModuleManager } from '@clerk/shared/moduleManager';

const store = new WeakMap<object, ModuleManager>();

export function setModuleManager(clerkInstance: object, mm: ModuleManager): void {
  store.set(clerkInstance, mm);
}

export function getModuleManager(clerkInstance: object): ModuleManager | undefined {
  return store.get(clerkInstance);
}
