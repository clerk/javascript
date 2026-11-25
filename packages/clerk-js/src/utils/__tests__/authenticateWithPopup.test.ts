import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Clerk } from '../../core/clerk';
import { _futureAuthenticateWithPopup, navigatePopup } from '../authenticateWithPopup';

describe('navigatePopup', () => {
  it.each(['https://idp.example.com/authorize?x=1', new URL('http://localhost:3000/sso')])(
    'navigates the popup to %s',
    to => {
      const popup = { location: { href: '' } };
      navigatePopup(popup, to);
      expect(popup.location.href).toBe(new URL(to).href);
    },
  );

  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x'])(
    'rejects %s',
    to => {
      const popup = { location: { href: '' } };
      expect(() => navigatePopup(popup, to)).toThrow(/not a valid popup navigation protocol/);
      expect(popup.location.href).toBe('');
    },
  );
});

describe('_futureAuthenticateWithPopup', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rejects and removes its listener when the redirect URL has a disallowed protocol', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const popup = { location: { href: '' } };
    const client = { client: {}, frontendApi: 'clerk.example.com' } as unknown as Clerk;

    await expect(
      _futureAuthenticateWithPopup(client, {
        popup,
        externalVerificationRedirectURL: new URL('javascript:alert(1)'),
      }),
    ).rejects.toThrow(/not a valid popup navigation protocol/);
    expect(popup.location.href).toBe('');
    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
