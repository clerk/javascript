import { TokenType } from '@clerk/backend/internal';
import type { NextFetchEvent } from 'next/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeAgentRulesOnce } from '../agent-rules-node';
import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';

vi.mock('../clerkClient');
vi.mock('../agent-rules-node', () => ({ writeAgentRulesOnce: vi.fn() }));
vi.mock(import('../constants.js'), async importOriginal => ({
  ...(await importOriginal()),
  PUBLISHABLE_KEY: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
  SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxx',
}));

describe('clerkMiddleware agent rules', () => {
  beforeEach(() => {
    vi.mocked(writeAgentRulesOnce).mockClear();
    vi.mocked(clerkClient).mockResolvedValue({
      authenticateRequest: vi.fn().mockResolvedValue({
        toAuth: () => ({ tokenType: TokenType.SessionToken, debug: (d: unknown) => d }),
        headers: new Headers(),
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
      }),
      // @ts-expect-error - mock
      telemetry: { record: vi.fn() },
    });
  });

  it('writes the agent rules on a request, even when the app never calls auth()', async () => {
    const request = new NextRequest('https://www.clerk.com/protected');

    await clerkMiddleware()(request, {} as NextFetchEvent);

    expect(writeAgentRulesOnce).toHaveBeenCalledTimes(1);
  });
});
