import type { ImportableModule, ModuleManager as ModuleManagerContract } from '@clerk/shared/moduleManager';

export class ModuleManager implements ModuleManagerContract {
  async import(module: ImportableModule): Promise<never> {
    throw Object.assign(new Error('This module requires an unavailable platform capability.'), {
      code: 'capability_unavailable',
      capability: module,
    });
  }
}
