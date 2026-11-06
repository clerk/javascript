import type { MosaicRuntime } from '@clerk/shared/internal/clerk-js/mosaicRuntime';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMosaicFetch } from '../use-mosaic-fetch';

const { clerk, loadRuntime, mFetch } = vi.hoisted(() => {
  const loadRuntime = vi.fn();
  const mFetch = vi.fn();
  return {
    loadRuntime,
    mFetch,
    clerk: { session: { id: 'sess_1' }, organization: undefined, __internal_moduleManager: { import: loadRuntime } },
  };
});

vi.mock('@clerk/shared/react', () => ({ useClerk: () => clerk }));

beforeEach(() => {
  vi.resetAllMocks();
  clerk.session = { id: 'sess_1' };
  loadRuntime.mockResolvedValue({ fetch: mFetch });
});

describe('useMosaicFetch', () => {
  it('rejects requests on a runtime without Mosaic request support', async () => {
    loadRuntime.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMosaicFetch());
    await expect(result.current({ path: '/demo' })).rejects.toMatchObject({ code: 'mosaic_request_unavailable' });
    expect(mFetch).not.toHaveBeenCalled();
  });

  it('does not send a write if the session changes while the runtime loads', async () => {
    let finish!: (runtime: MosaicRuntime) => void;
    loadRuntime.mockImplementation(() => new Promise(resolve => (finish = resolve)));
    const { result } = renderHook(() => useMosaicFetch());
    const pending = result.current({ path: '/demo', method: 'PUT', body: { name: 'Updated' } });
    clerk.session = { id: 'sess_2' };
    finish({ fetch: mFetch });
    await expect(pending).rejects.toMatchObject({ code: 'mosaic_request_context_changed' });
    expect(mFetch).not.toHaveBeenCalled();
  });

  it('does not send a query cancelled while the runtime loads', async () => {
    const controller = new AbortController();
    const { result } = renderHook(() => useMosaicFetch());
    const pending = result.current({ path: '/demo', signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(mFetch).not.toHaveBeenCalled();
  });
});
