import { describe, expect, it, vi } from 'vitest';

import { resolveOAuthFlow } from '../resolveOAuthFlow';

const makeClerk = (hasOAuthTransport: boolean) => ({ __internal_hasOAuthTransport: hasOAuthTransport });

describe('resolveOAuthFlow', () => {
  it('uses transport when one is registered', () => {
    expect(
      resolveOAuthFlow({
        requestedFlow: 'popup',
        clerk: makeClerk(true),
        prefersPopup: vi.fn(() => true),
      }),
    ).toBe('transport');
  });

  it('uses popup when requested explicitly', () => {
    expect(
      resolveOAuthFlow({
        requestedFlow: 'popup',
        clerk: makeClerk(false),
        prefersPopup: vi.fn(() => false),
      }),
    ).toBe('popup');
  });

  it('uses popup in auto mode when the origin prefers popup', () => {
    expect(
      resolveOAuthFlow({
        requestedFlow: 'auto',
        clerk: makeClerk(false),
        prefersPopup: vi.fn(() => true),
      }),
    ).toBe('popup');
  });

  it('uses redirect by default', () => {
    expect(
      resolveOAuthFlow({
        requestedFlow: 'auto',
        clerk: makeClerk(false),
        prefersPopup: vi.fn(() => false),
      }),
    ).toBe('redirect');
  });

  it('treats a missing requested flow as auto', () => {
    expect(
      resolveOAuthFlow({
        clerk: makeClerk(false),
        prefersPopup: vi.fn(() => true),
      }),
    ).toBe('popup');
  });
});
