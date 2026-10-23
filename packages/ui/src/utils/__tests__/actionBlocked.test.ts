import type { ClerkAPIError } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { actionBlockedDetailsFrom, getActionBlockedDetails, safeHref } from '../actionBlocked';

const blocked = (meta?: ClerkAPIError['meta']): ClerkAPIError => ({
  code: 'action_blocked',
  message: 'Action blocked',
  meta,
});

describe('safeHref', () => {
  it('allows https', () => {
    expect(safeHref('https://help.example.com/blocked?ref=7Q8ikxgt')).toBe(
      'https://help.example.com/blocked?ref=7Q8ikxgt',
    );
  });

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
      getActionBlockedDetails(
        blocked({
          traceId: '7Q8ikxgt',
          kind: 'custom_kind',
          title: 'We could not verify this sign-in',
          description: 'Try again from a different network.',
          linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
          linkText: 'Contact support',
          data: { region: 'EU', retryAfter: 3600, appeal: true },
        }),
      ),
    ).toEqual({
      traceId: '7Q8ikxgt',
      kind: 'custom_kind',
      title: 'We could not verify this sign-in',
      description: 'Try again from a different network.',
      linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
      linkText: 'Contact support',
      data: { region: 'EU', retryAfter: 3600, appeal: true },
    });
  });

  it('accepts a reference with no message', () => {
    const details = getActionBlockedDetails(blocked({ traceId: '7Q8ikxgt' }));
    expect(details?.traceId).toBe('7Q8ikxgt');
    expect(details?.title).toBeUndefined();
  });

  it('returns null when there is nothing to show', () => {
    expect(getActionBlockedDetails(undefined)).toBeNull();
    expect(getActionBlockedDetails(blocked())).toBeNull();
    expect(getActionBlockedDetails(blocked({}))).toBeNull();
  });

  it('does not count fields the screen does not render', () => {
    expect(getActionBlockedDetails(blocked({ linkText: 'Contact support' }))).toBeNull();
    expect(getActionBlockedDetails(blocked({ kind: 'custom_kind' }))).toBeNull();
    expect(getActionBlockedDetails(blocked({ data: { a: 1 } }))).toBeNull();
  });
});

describe('actionBlockedDetailsFrom', () => {
  it('detects a blocked request carrying details', () => {
    expect(actionBlockedDetailsFrom(blocked({ traceId: '7Q8ikxgt' }))).toMatchObject({ traceId: '7Q8ikxgt' });
  });

  it('ignores every other error', () => {
    const other: ClerkAPIError = { code: 'form_param_nil', message: 'x', meta: { traceId: 'x' } };
    expect(actionBlockedDetailsFrom(other)).toBeNull();
  });

  it('ignores a blocked request with no details', () => {
    expect(actionBlockedDetailsFrom(blocked())).toBeNull();
  });

  it('ignores non-errors', () => {
    expect(actionBlockedDetailsFrom(undefined)).toBeNull();
    expect(actionBlockedDetailsFrom(null)).toBeNull();
    expect(actionBlockedDetailsFrom('a plain string message')).toBeNull();
    expect(actionBlockedDetailsFrom(42)).toBeNull();
  });
});
