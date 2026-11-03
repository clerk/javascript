import type {
  MosaicRequestInit,
  MosaicRequestOptions,
  MosaicRuntime,
} from '@clerk/shared/internal/clerk-js/mosaicRuntime';

import type { FapiRequestInit } from './fapiClient';
import { BaseResource } from './resources/Base';

export const mosaicRuntime: MosaicRuntime = {
  request: async <T>(init: MosaicRequestInit, options?: MosaicRequestOptions) => {
    const payload = await BaseResource._fetch<T>({ ...init, method: init.method ?? 'GET' } as FapiRequestInit, options);
    return payload?.response ?? null;
  },
};
