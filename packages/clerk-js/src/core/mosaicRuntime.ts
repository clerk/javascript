import type { MosaicFetchInit, MosaicFetchOptions, MosaicRuntime } from '@clerk/shared/internal/clerk-js/mosaicRuntime';

import type { FapiRequestInit } from './fapiClient';
import { BaseResource } from './resources/Base';

export const mosaicRuntime: MosaicRuntime = {
  fetch: async <T>(init: MosaicFetchInit, options?: MosaicFetchOptions) => {
    const payload = await BaseResource._fetch({ ...init, method: init.method ?? 'GET' } as FapiRequestInit, options);
    return (payload?.response ?? null) as unknown as T | null;
  },
};
