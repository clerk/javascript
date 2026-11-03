import type { MosaicRuntime } from '@clerk/shared/internal/clerk-js/mosaicRuntime';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMosaicRequest } from '../use-mosaic-request';

const { clerk, loadRuntime, request } = vi.hoisted(() => {
  const loadRuntime = vi.fn();
  const request = vi.fn();
  return {
    loadRuntime,
    request,
    clerk: { session: { id: 'sess_1' }, organization: undefined, __internal_moduleManager: { import: loadRuntime } },
  };
});

vi.mock('@clerk/shared/react', () => ({ useClerk: () => clerk }));

beforeEach(() => {
  vi.resetAllMocks();
  clerk.session = { id: 'sess_1' };
  loadRuntime.mockResolvedValue({ request });
});

describe('useMosaicRequest', () => {
  it('rejects requests on a runtime without Mosaic request support', async () => {
    loadRuntime.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMosaicRequest());
    await expect(result.current({ path: '/demo' })).rejects.toMatchObject({ code: 'mosaic_request_unavailable' });
    expect(request).not.toHaveBeenCalled();
  });

  it('does not send a write if the session changes while the runtime loads', async () => {
    let finish!: (runtime: MosaicRuntime) => void;
    loadRuntime.mockImplementation(() => new Promise(resolve => (finish = resolve)));
    const { result } = renderHook(() => useMosaicRequest());
    const pending = result.current({ path: '/demo', method: 'PUT', body: { name: 'Updated' } });
    clerk.session = { id: 'sess_2' };
    finish({ request });
    await expect(pending).rejects.toMatchObject({ code: 'mosaic_request_context_changed' });
    expect(request).not.toHaveBeenCalled();
  });

  it('does not send a query cancelled while the runtime loads', async () => {
    const controller = new AbortController();
    const { result } = renderHook(() => useMosaicRequest());
    const pending = result.current({ path: '/demo', signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(request).not.toHaveBeenCalled();
  });
});
