import { describe, expect, test } from 'vitest';

import type { NavigationEvent, NavigationVerdict } from '../webViewNavigation';
import { judgeNavigation } from '../webViewNavigation';

const FAPI_TRANSFER = 'https://clerk.example.com/v1/session_transfers/redeem?token=one-time';
const PROXIED_TRANSFER = 'https://app.example.com/__clerk/v1/session_transfers/redeem?token=one-time';

const pending: NavigationVerdict = { kind: 'pending' };
const ready: NavigationVerdict = { kind: 'ready' };
const failed = (code: string): NavigationVerdict => ({ kind: 'failed', code });

const start = (url: string): NavigationEvent => ({ kind: 'load-start', url });
const end = (url: string, loadFailed = false): NavigationEvent => ({ kind: 'load-end', url, failed: loadFailed });
const httpError = (url: string): NavigationEvent => ({ kind: 'http-error', url });

describe('judgeNavigation', () => {
  test.each<[string, string, NavigationEvent, NavigationVerdict]>([
    ['redeem page starts loading', FAPI_TRANSFER, start(FAPI_TRANSFER), pending],
    ['redeem page finishes loading', FAPI_TRANSFER, end(FAPI_TRANSFER), pending],
    [
      'redeem form post finishes without the token',
      FAPI_TRANSFER,
      end('https://clerk.example.com/v1/session_transfers/redeem'),
      pending,
    ],
    ['redeem page returns an HTTP error', FAPI_TRANSFER, httpError(FAPI_TRANSFER), failed('load_failed')],
    ['redeem page fails to load', FAPI_TRANSFER, end(FAPI_TRANSFER, true), failed('load_failed')],
    ['a load fails with no URL', FAPI_TRANSFER, end('', true), failed('load_failed')],
    ['destination fails to load', FAPI_TRANSFER, end('https://app.example.com/billing', true), failed('load_failed')],
    ['destination starts loading', FAPI_TRANSFER, start('https://app.example.com/billing'), pending],
    ['destination finishes loading', FAPI_TRANSFER, end('https://app.example.com/billing'), ready],
    ['destination returns an HTTP error', FAPI_TRANSFER, httpError('https://app.example.com/billing'), pending],
    [
      'redirect carries a status FAPI does not send for session transfers',
      FAPI_TRANSFER,
      end('https://app.example.com/billing?__clerk_status=failed&__clerk_error_code=expired'),
      ready,
    ],
    [
      'redirect carries a session_transfer_failed status',
      FAPI_TRANSFER,
      start('https://app.example.com/billing?__clerk_status=session_transfer_failed&__clerk_error_code=already_used'),
      failed('already_used'),
    ],
    [
      'redirect carries an error code without a status',
      FAPI_TRANSFER,
      end('https://app.example.com/?__clerk_error_code=invalid_token'),
      ready,
    ],
    [
      'finished page still carries the error code',
      FAPI_TRANSFER,
      end(
        'https://app.example.com/billing?__clerk_status=session_transfer_failed&__clerk_error_code=cross_site_request',
      ),
      failed('cross_site_request'),
    ],
    [
      'error code arrives with an unrelated status',
      FAPI_TRANSFER,
      end('https://app.example.com/billing?__clerk_status=verified&__clerk_error_code=expired'),
      ready,
    ],
    ['about:blank finishes loading', FAPI_TRANSFER, end('about:blank'), pending],
    [
      'same path on another host finishes loading',
      FAPI_TRANSFER,
      end('https://app.example.com/v1/session_transfers/redeem'),
      ready,
    ],
    ['proxied redeem page finishes loading', PROXIED_TRANSFER, end(PROXIED_TRANSFER), pending],
    [
      'proxied redeem form post finishes',
      PROXIED_TRANSFER,
      end('https://app.example.com/__clerk/v1/session_transfers/redeem'),
      pending,
    ],
    ['proxied redeem page returns an HTTP error', PROXIED_TRANSFER, httpError(PROXIED_TRANSFER), failed('load_failed')],
    ['destination on the proxy host finishes loading', PROXIED_TRANSFER, end('https://app.example.com/billing'), ready],
  ])('%s', (_, transferUrl, event, verdict) => {
    expect(judgeNavigation(transferUrl, event)).toEqual(verdict);
  });
});
