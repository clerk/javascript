import { constants } from '@clerk/backend/internal';
import { cookies, headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PoppyCallbackPage } from '../PoppyCallbackPage';
import { decryptClerkRequestData } from '../utils';

vi.mock('next/headers', () => ({ headers: vi.fn(), cookies: vi.fn() }));
vi.mock('../utils', () => ({ decryptClerkRequestData: vi.fn() }));

const endpoint = 'https://company.example/poppy/browser-session';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(decryptClerkRequestData).mockReturnValue({
    __experimental_poppy: { browserSessionEndpoint: endpoint, redirectTo: '/cart' },
  });
  vi.mocked(headers).mockResolvedValue(new Headers({ [constants.Headers.ClerkUrl]: endpoint + '/callback' }));
  vi.mocked(cookies, { partial: true }).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'one-use-ticket' }),
  });
});

describe('PoppyCallbackPage', () => {
  it('passes the protected ticket to the native sign-in callback without URL transport', async () => {
    const page = await PoppyCallbackPage();
    expect(page.props).toEqual({ ticket: 'one-use-ticket', redirectTo: 'https://company.example/cart' });
  });

  it('requires a configured middleware callback', async () => {
    vi.mocked(decryptClerkRequestData).mockReturnValue({});
    await expect(PoppyCallbackPage()).rejects.toThrow('configured Clerk middleware');
  });

  it('shows a restart action when the ticket cookie is missing', async () => {
    vi.mocked(cookies, { partial: true }).mockResolvedValue({ get: vi.fn() });
    const page = await PoppyCallbackPage();
    expect(page.props.children).toBe('Start the browser connection again.');
  });
});
