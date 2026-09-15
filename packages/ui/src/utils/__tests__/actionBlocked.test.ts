import { describe, expect, it } from 'vitest';

import { actionBlockedDetailsFrom, getActionBlockedDetails, safeHref } from '../actionBlocked';

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

// This is what card state calls on every error, so it decides whether ANY card
// shows the terminal screen. It must be exact about the code: a false positive
// would replace a correctable form error with a dead end.
describe('actionBlockedDetailsFrom', () => {
  it('detects a blocked request carrying details', () => {
    expect(
      actionBlockedDetailsFrom({
        code: 'action_blocked',
        message: 'Action blocked',
        meta: { traceId: '7Q8ikxgt' },
      }),
    ).toEqual({
      traceId: '7Q8ikxgt',
      title: undefined,
      description: undefined,
      linkUrl: undefined,
      linkText: undefined,
    });
  });

  it('ignores every other error', () => {
    expect(actionBlockedDetailsFrom({ code: 'form_param_nil', meta: { traceId: 'x' } })).toBeNull();
    expect(actionBlockedDetailsFrom({ code: 'form_password_incorrect' })).toBeNull();
  });

  // A blocked request from an older backend carries no meta. It must fall
  // through to the inline error rather than rendering an empty screen.
  it('ignores a blocked request with no details', () => {
    expect(actionBlockedDetailsFrom({ code: 'action_blocked', message: 'Action blocked' })).toBeNull();
  });

  it('ignores non-errors', () => {
    expect(actionBlockedDetailsFrom(undefined)).toBeNull();
    expect(actionBlockedDetailsFrom(null)).toBeNull();
    expect(actionBlockedDetailsFrom('a plain string message')).toBeNull();
    expect(actionBlockedDetailsFrom(42)).toBeNull();
  });
});

// kind and data are CARRIED, never rendered. A rule configured with only a kind
// is one whose application draws its own screen, so treating it as "nothing to
// show" would take the feature away from exactly that integration.
describe('kind and data', () => {
  it('reads them off the meta', () => {
    const details = getActionBlockedDetails({
      code: 'action_blocked',
      message: 'Action blocked',
      meta: {
        traceId: '7Q8ikxgt',
        kind: 'vpn_detected',
        data: { region: 'EU', retryAfter: 3600, appeal: true },
      },
    } as any);
    expect(details?.kind).toBe('vpn_detected');
    expect(details?.data).toEqual({ region: 'EU', retryAfter: 3600, appeal: true });
  });

  it('treats a kind on its own as something to show', () => {
    expect(
      getActionBlockedDetails({ code: 'action_blocked', message: 'x', meta: { kind: 'vpn_detected' } } as any),
    ).not.toBeNull();
  });

  it('treats data on its own as something to show', () => {
    expect(
      getActionBlockedDetails({ code: 'action_blocked', message: 'x', meta: { data: { a: 1 } } } as any),
    ).not.toBeNull();
  });
});
