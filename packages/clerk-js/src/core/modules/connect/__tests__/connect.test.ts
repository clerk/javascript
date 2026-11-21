import { ClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../../../resources/internal';
import { Connect } from '../index';

const redirectResponse = {
  response: {
    status: 'requires_action',
    action: { type: 'redirect', url: 'https://clerk.example.com/v1/connect/authorize?attempt=a', expires_at: 1 },
  },
};

const connectionJSON = {
  id: 'con_1',
  connector: 'github',
  connector_display_name: 'GitHub',
  connector_status: 'active',
  slug: 'github',
  scopes: ['read:user'],
  status: 'active',
  provider_account: null,
  created_at: 1,
  updated_at: 1,
  disconnected_at: null,
};

const apiError = (status: number, errors: unknown[]) =>
  new ClerkAPIResponseError('Request failed', { data: errors as never, status });

const settled = async (promise: Promise<unknown>) => {
  let done = false;
  void promise.then(
    () => (done = true),
    () => (done = true),
  );
  await new Promise(resolve => setTimeout(resolve, 10));
  return done;
};

describe('Connect', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the browser to the provider and never settles when connecting requires an action', async () => {
    const fetch = vi.spyOn(BaseResource, '_fetch').mockResolvedValue(redirectResponse as never);
    const navigate = vi.fn();

    const pending = new Connect(navigate).connections.create({ connector: 'github', returnUrl: '/settings' });

    expect(await settled(pending)).toBe(false);
    expect(navigate).toHaveBeenCalledWith('https://clerk.example.com/v1/connect/authorize?attempt=a');
    expect(fetch.mock.calls[0][0]).toMatchObject({ body: { connector: 'github', returnUrl: '/settings' } });
  });

  it('returns the action without navigating when redirect is false', async () => {
    const fetch = vi.spyOn(BaseResource, '_fetch').mockResolvedValue(redirectResponse as never);
    const navigate = vi.fn();

    const result = await new Connect(navigate).connections.create({
      connector: 'github',
      returnUrl: '/settings',
      redirect: false,
    });

    expect(navigate).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'requires_action',
      action: { type: 'redirect', url: 'https://clerk.example.com/v1/connect/authorize?attempt=a' },
    });
    expect(fetch.mock.calls[0][0]).toMatchObject({ body: { connector: 'github', returnUrl: '/settings' } });
    expect((fetch.mock.calls[0][0] as { body: object }).body).not.toHaveProperty('redirect');
  });

  it('does not navigate when the connection is already complete', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: { status: 'complete', connection: connectionJSON },
    } as never);
    const navigate = vi.fn();

    const result = await new Connect(navigate).connections.reauthorize('con_1', { returnUrl: '/settings' });

    expect(navigate).not.toHaveBeenCalled();
    expect(result.status).toBe('complete');
    expect(result.status === 'complete' && result.connection).toMatchObject({
      connectorDisplayName: 'GitHub',
      connectorStatus: 'active',
    });
  });

  it('reauthorizes a disconnected slug with the same options when create is refused', async () => {
    const fetch = vi
      .spyOn(BaseResource, '_fetch')
      .mockRejectedValueOnce(
        apiError(409, [
          {
            code: 'connection_reauthorization_required',
            message: 'Reauthorize the connection',
            meta: { connection_id: 'con_9', connection_status: 'disconnected' },
          },
        ]),
      )
      .mockResolvedValueOnce(redirectResponse as never);
    const navigate = vi.fn();

    const result = await new Connect(navigate).connections.create({
      connector: 'github',
      slug: 'github',
      scopes: ['repo'],
      returnUrl: '/settings',
      redirect: false,
    });

    expect(result.status).toBe('requires_action');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/me/connections/con_9/reauthorize',
      body: { scopes: ['repo'], returnUrl: '/settings' },
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('rethrows other create errors', async () => {
    vi.spyOn(BaseResource, '_fetch').mockRejectedValue(
      apiError(404, [{ code: 'connector_not_found', message: 'Not found' }]),
    );

    await expect(new Connect(vi.fn()).connections.create({ connector: 'nope', returnUrl: '/' })).rejects.toMatchObject({
      errors: [{ code: 'connector_not_found' }],
    });
  });

  it('names SDK parameters, not API parameters, in errors', async () => {
    vi.spyOn(BaseResource, '_fetch').mockRejectedValue(
      apiError(422, [
        {
          code: 'form_param_missing',
          message: 'return_url must be included.',
          long_message: 'return_url must be included.',
          meta: { param_name: 'return_url' },
        },
      ]),
    );

    const error = await new Connect(vi.fn()).connections.create({ connector: 'github' }).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ClerkAPIResponseError);
    expect((error as ClerkAPIResponseError).status).toBe(422);
    expect((error as ClerkAPIResponseError).errors[0]).toMatchObject({
      code: 'form_param_missing',
      message: 'returnUrl must be included.',
      longMessage: 'returnUrl must be included.',
      meta: { paramName: 'returnUrl' },
    });
  });
});
