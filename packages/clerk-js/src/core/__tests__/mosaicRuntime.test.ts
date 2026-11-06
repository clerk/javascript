import { ClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModuleManager } from '../../utils/moduleManager';
import { createFapiClient } from '../fapiClient';
import { FraudProtection } from '../fraudProtection';
import { mosaicRuntime } from '../mosaicRuntime';
import { BaseResource } from '../resources/Base';
import { Client } from '../resources/Client';

const fetchMock = vi.fn<typeof fetch>();
const updateClient = vi.fn();
const handleUnauthenticated = vi.fn();
const originalClerk = BaseResource.clerk;

function response(payload: unknown, status = 200, headers?: HeadersInit): Response {
  return {
    status,
    statusText: String(status),
    ok: status >= 200 && status < 300,
    headers: new Headers(headers),
    json: () => Promise.resolve(payload),
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  const client = createFapiClient({
    frontendApi: 'clerk.example.com',
    proxyUrl: 'https://example.com/clerk',
    instanceType: 'production',
    getSessionId: () => 'sess_demo',
  });
  BaseResource.clerk = {
    getFapiClient: () => client,
    __internal_setCountry: vi.fn(),
    updateClient,
    handleUnauthenticated,
    __internal_handleUnauthenticatedDevBrowser: vi.fn(),
  } as unknown as typeof BaseResource.clerk;
});

afterEach(() => {
  BaseResource.clerk = originalClerk;
  Client.clearInstance();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Mosaic runtime requests', () => {
  it('loads through the existing module manager', async () => {
    fetchMock.mockResolvedValue(response({ response: { id: 'ins_demo' } }));
    const runtime = await new ModuleManager().import('@clerk/mosaic-runtime');
    await expect(runtime?.fetch({ path: '/demo' })).resolves.toEqual({ id: 'ins_demo' });
  });
  it('uses FAPI routing, session parameters, form serialization, and method rewriting', async () => {
    fetchMock.mockResolvedValue(response({ response: { id: 'ins_demo', name: 'New name' } }));
    const controller = new AbortController();

    await expect(
      mosaicRuntime.fetch({ path: '/demo', method: 'PUT', body: { name: 'New name' }, signal: controller.signal }),
    ).resolves.toEqual({ id: 'ins_demo', name: 'New name' });

    const [input, init] = fetchMock.mock.calls[0];
    const url = input as URL;
    expect(url.href).toContain('https://example.com/clerk/v1/demo?');
    expect(url.searchParams.get('_method')).toBe('PUT');
    expect(url.searchParams.get('_clerk_session_id')).toBe('sess_demo');
    expect(init).toMatchObject({ method: 'POST', credentials: 'include', body: 'name=New+name' });
    expect(init?.signal).toBe(controller.signal);
  });

  it('keeps API error conversion, retry-after metadata, and authentication handling', async () => {
    fetchMock.mockResolvedValueOnce(
      response({ errors: [{ code: 'session_expired', long_message: 'Sign in again.' }] }, 401),
    );
    await expect(mosaicRuntime.fetch({ path: '/demo' })).rejects.toBeInstanceOf(ClerkAPIResponseError);
    expect(handleUnauthenticated).toHaveBeenCalledOnce();

    fetchMock.mockResolvedValueOnce(
      response({ errors: [{ code: 'rate_limit_exceeded', long_message: 'Try again later.' }] }, 429, {
        'retry-after': '30',
      }),
    );
    await expect(mosaicRuntime.fetch({ path: '/demo' })).rejects.toMatchObject({ status: 429, retryAfter: 30 });
  });

  it('runs fraud protection and applies client updates from mutation responses', async () => {
    const execute = vi.spyOn(FraudProtection.getInstance(), 'execute');
    fetchMock.mockResolvedValue(
      response({ response: { id: 'ins_demo' }, client: { id: 'client_demo', sessions: [] } }),
    );

    await mosaicRuntime.fetch({ path: '/demo', method: 'PUT', body: { name: 'Demo' } });

    expect(execute).toHaveBeenCalledOnce();
    expect(updateClient).toHaveBeenCalledWith(expect.objectContaining({ id: 'client_demo' }));
    updateClient.mockClear();

    await mosaicRuntime.fetch({ path: '/demo', method: 'PUT' }, { skipUpdateClient: true });
    expect(updateClient).not.toHaveBeenCalled();
  });

  it('supports GET options and empty responses without creating a resource', async () => {
    fetchMock.mockResolvedValueOnce(response({ response: { id: 'ins_demo' } }));
    await expect(
      mosaicRuntime.fetch<{ id: string }>({ path: '/demo', method: 'GET', search: { view: 'summary' } }),
    ).resolves.toEqual({ id: 'ins_demo' });
    expect((fetchMock.mock.calls[0][0] as URL).searchParams.get('view')).toBe('summary');

    fetchMock.mockResolvedValueOnce(response(null, 204));
    await expect(mosaicRuntime.fetch({ path: '/demo', method: 'PUT' })).resolves.toBeNull();
  });
});
