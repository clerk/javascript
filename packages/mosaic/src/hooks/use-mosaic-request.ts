import { ClerkRuntimeError } from '@clerk/shared/error';
import type { MosaicRequest } from '@clerk/shared/internal/clerk-js/mosaicRuntime';
import { useClerk } from '@clerk/shared/react';
import { useCallback } from 'react';

export function useMosaicRequest(): MosaicRequest {
  const clerk = useClerk();

  return useCallback<MosaicRequest>(
    async (init, options) => {
      const sessionId = clerk.session?.id;
      const organizationId = clerk.organization?.id;
      const runtime = await clerk.__internal_moduleManager?.import('@clerk/mosaic-runtime');
      if (!runtime) {
        throw new ClerkRuntimeError('This Clerk runtime does not support Mosaic requests.', {
          code: 'mosaic_request_unavailable',
        });
      }
      if (clerk.session?.id !== sessionId || clerk.organization?.id !== organizationId) {
        throw new ClerkRuntimeError('The active request context changed.', { code: 'mosaic_request_context_changed' });
      }
      init.signal?.throwIfAborted();
      return runtime.request(init, options);
    },
    [clerk],
  );
}
