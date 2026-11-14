import type { SessionTransferErrorCode } from './errors';

export type NavigationEvent =
  | { kind: 'load-start'; url: string }
  | { kind: 'load-end'; url: string; failed: boolean }
  | { kind: 'http-error'; url: string };

export type NavigationVerdict =
  | { kind: 'pending' }
  | { kind: 'ready' }
  | { kind: 'failed'; code: SessionTransferErrorCode };

const PENDING: NavigationVerdict = { kind: 'pending' };
const READY: NavigationVerdict = { kind: 'ready' };
const LOAD_FAILED: NavigationVerdict = { kind: 'failed', code: 'load_failed' };
const REDEEM_FAILURE_STATUS = 'session_transfer_failed';

export function judgeNavigation(transferUrl: string, event: NavigationEvent): NavigationVerdict {
  if (event.kind === 'load-end' && event.failed) {
    return LOAD_FAILED;
  }

  const url = parseHttpUrl(event.url);
  if (!url) {
    return PENDING;
  }

  if (isRedeemPage(transferUrl, url)) {
    return event.kind === 'http-error' ? LOAD_FAILED : PENDING;
  }

  const redeemErrorCode = getRedeemErrorCode(url);
  if (redeemErrorCode) {
    return { kind: 'failed', code: redeemErrorCode };
  }

  return event.kind === 'load-end' ? READY : PENDING;
}

function isRedeemPage(transferUrl: string, url: URL): boolean {
  const redeemUrl = new URL(transferUrl);
  return url.origin === redeemUrl.origin && url.pathname === redeemUrl.pathname;
}

function getRedeemErrorCode(url: URL): string | null {
  return url.searchParams.get('__clerk_status') === REDEEM_FAILURE_STATUS
    ? url.searchParams.get('__clerk_error_code')
    : null;
}

function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}
