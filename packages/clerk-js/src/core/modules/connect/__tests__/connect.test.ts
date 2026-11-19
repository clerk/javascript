import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../../../resources/internal';
import { Connect } from '../index';

describe('Connect', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the browser to the provider when connecting requires an action', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: {
        status: 'requires_action',
        action: { type: 'redirect', url: 'https://clerk.example.com/v1/connect/authorize?attempt=a', expires_at: 1 },
      },
    } as never);
    const navigate = vi.fn();

    const result = await new Connect(navigate).connections.create({ connector: 'github', returnUrl: '/settings' });

    expect(navigate).toHaveBeenCalledWith('https://clerk.example.com/v1/connect/authorize?attempt=a');
    expect(result.status).toBe('requires_action');
  });

  it('does not navigate when the connection is already complete', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: {
        status: 'complete',
        connection: {
          id: 'con_1',
          connector: 'github',
          key: 'github',
          scopes: ['read:user'],
          status: 'active',
          provider_account: null,
          created_at: 1,
          updated_at: 1,
          disconnected_at: null,
        },
      },
    } as never);
    const navigate = vi.fn();

    const result = await new Connect(navigate).connections.reauthorize('con_1', { returnUrl: '/settings' });

    expect(navigate).not.toHaveBeenCalled();
    expect(result.status).toBe('complete');
  });
});
