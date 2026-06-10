import type { SetupMainOptions, SetupMainReturn } from '../shared/types';
import { setupTokenCacheIpcHandlers } from './ipc-handlers';

export function setupMain(options: SetupMainOptions): SetupMainReturn {
  if (!options.storage) {
    throw new Error(
      'Clerk: setupMain requires a storage adapter. Pass setupMain({ storage: storage() }) from @clerk/electron/storage, or provide a custom storage adapter.',
    );
  }

  const cleanupTokenPersistence = setupTokenCacheIpcHandlers(options.storage);

  return {
    cleanup() {
      cleanupTokenPersistence();
    },
  };
}
