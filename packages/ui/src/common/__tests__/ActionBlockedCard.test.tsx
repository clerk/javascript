import { describe, expect, it } from 'vitest';

import { getActionBlockedDetails, safeHref } from '../ActionBlockedCard';

describe('safeHref', () => {
  it('allows https', () => {
    expect(safeHref('https://help.example.com/blocked?ref=7Q8ikxgt')).toBe(
      'https://help.example.com/blocked?ref=7Q8ikxgt',
    );
  });

  // The link is chosen by the application's owner and rendered in an end user's
  // browser. It is checked before it is sent, so this is the second check
  // rather than the only one — but it is the one standing between a value that
  // arrived anyway and an href.
  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'http://example.com/help',
    '/relative',
    '//example.com',
    'not a url',
    '',
  ])('rejects %j', url => {
    expect(safeHref(url)).toBeNull();
  });

  it('rejects a missing link', () => {
    expect(safeHref(undefined)).toBeNull();
  });
});

describe('getActionBlockedDetails', () => {
  it('reads every field off the error meta', () => {
    expect(
      getActionBlockedDetails({
        code: 'action_blocked',
        message: 'Action blocked',
        meta: {
          traceId: '7Q8ikxgt',
          title: 'We could not verify this sign-in',
          description: 'Try again from a different network.',
          linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
          linkText: 'Contact support',
        },
      } as any),
    ).toEqual({
      traceId: '7Q8ikxgt',
      title: 'We could not verify this sign-in',
      description: 'Try again from a different network.',
      linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
      linkText: 'Contact support',
    });
  });

  // The common case: no application-supplied message, but the end user still
  // gets a reference to quote.
  it('accepts a reference with no message', () => {
    const details = getActionBlockedDetails({
      code: 'action_blocked',
      message: 'Action blocked',
      meta: { traceId: '7Q8ikxgt' },
    } as any);
    expect(details).not.toBeNull();
    expect(details?.traceId).toBe('7Q8ikxgt');
    expect(details?.title).toBeUndefined();
  });

  // An older backend sends no meta at all. Returning null is what makes the
  // caller fall back to the previous inline error instead of rendering a blank
  // screen.
  it('returns null when there is nothing to show', () => {
    expect(getActionBlockedDetails(undefined)).toBeNull();
    expect(getActionBlockedDetails({ code: 'action_blocked', message: 'x' } as any)).toBeNull();
    expect(getActionBlockedDetails({ code: 'action_blocked', message: 'x', meta: {} } as any)).toBeNull();
  });

  // A label with no destination is not a link, so it alone is not a reason to
  // take over the screen.
  it('ignores a link label with no link', () => {
    expect(
      getActionBlockedDetails({
        code: 'action_blocked',
        message: 'x',
        meta: { linkText: 'Contact support' },
      } as any),
    ).toBeNull();
  });
});
