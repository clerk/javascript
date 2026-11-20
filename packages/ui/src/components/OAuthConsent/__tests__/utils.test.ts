import { afterEach, describe, expect, it, vi } from 'vitest';

import { getForwardedParams } from '../utils';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getForwardedParams', () => {
  it('does not forward the Clerk JS version already supplied by the action URL', () => {
    vi.stubGlobal('window', {
      location: {
        search: '?_clerk_js_version=v1.34.0&client_id=client_123&state=state_123&target_flow=chatgpt_siwc',
      },
    });

    expect(getForwardedParams()).toEqual([
      ['client_id', 'client_123'],
      ['state', 'state_123'],
      ['target_flow', 'chatgpt_siwc'],
    ]);
  });
});
