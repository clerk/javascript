import type { ModuleManager } from '@clerk/shared/moduleManager';

let storedModuleManager: ModuleManager | undefined;

export function setModuleManager(mm: ModuleManager): void {
  storedModuleManager = mm;
}

export function getModuleManager(): ModuleManager | undefined {
  return storedModuleManager;
}
