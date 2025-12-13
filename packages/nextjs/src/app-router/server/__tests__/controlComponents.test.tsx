import type { ShowWhenCondition } from '@clerk/shared/types';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '../auth';
import { Show } from '../controlComponents';

vi.mock('../auth', () => ({
  auth: vi.fn(),
}));

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

const render = async (element: Promise<React.JSX.Element | null>) => {
  const resolved = await element;
  if (!resolved) {
    return '';
  }
  return renderToStaticMarkup(resolved);
};

const setAuthReturn = (value: { has?: (params: unknown) => boolean; userId: string | null }) => {
  mockAuth.mockResolvedValue(value);
};

const signedInWhen: ShowWhenCondition = 'signedIn';
const signedOutWhen: ShowWhenCondition = 'signedOut';

describe('Show (App Router server)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when signed in', async () => {
    const has = vi.fn();
    setAuthReturn({ has, userId: 'user_123' });

    const html = await render(
      Show({
        children: <div>signed-in</div>,
        fallback: <div>fallback</div>,
        treatPendingAsSignedOut: false,
        when: signedInWhen,
      }),
    );

    expect(mockAuth).toHaveBeenCalledWith({ treatPendingAsSignedOut: false });
    expect(html).toContain('signed-in');
  });

  it('renders children when signed out', async () => {
    const has = vi.fn();
    setAuthReturn({ has, userId: null });

    const html = await render(
      Show({
        children: <div>signed-out</div>,
        fallback: <div>fallback</div>,
        treatPendingAsSignedOut: false,
        when: signedOutWhen,
      }),
    );

    expect(html).toContain('signed-out');
  });

  it('renders fallback when signed out but user is present', async () => {
    const has = vi.fn();
    setAuthReturn({ has, userId: 'user_123' });

    const html = await render(
      Show({
        children: <div>signed-out</div>,
        fallback: <div>fallback</div>,
        treatPendingAsSignedOut: false,
        when: signedOutWhen,
      }),
    );

    expect(html).toContain('fallback');
  });

  it('uses has() when when is an authorization object', async () => {
    const has = vi.fn().mockReturnValue(true);
    setAuthReturn({ has, userId: 'user_123' });

    const html = await render(
      Show({
        children: <div>authorized</div>,
        fallback: <div>fallback</div>,
        treatPendingAsSignedOut: false,
        when: { role: 'admin' },
      }),
    );

    expect(has).toHaveBeenCalledWith({ role: 'admin' });
    expect(html).toContain('authorized');
  });

  it('uses predicate when when is a function', async () => {
    const has = vi.fn().mockReturnValue(true);
    const predicate = vi.fn().mockReturnValue(true);
    setAuthReturn({ has, userId: 'user_123' });

    const html = await render(
      Show({
        children: <div>predicate-pass</div>,
        fallback: <div>fallback</div>,
        treatPendingAsSignedOut: false,
        when: predicate,
      }),
    );

    expect(predicate).toHaveBeenCalledWith(has);
    expect(html).toContain('predicate-pass');
  });
});
