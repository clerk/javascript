import type { ClerkHostRouter } from '~/react/router';

// ================= Schema ================= //

export interface RouterSchema {
  context: RouterContext;
  input: RouterInput;
  events: RouterEvent;
}

// ================= Context ================= //

export interface RouterContext {
  pathname: string;
  router: ClerkHostRouter;
  searchParams: URLSearchParams;
}

// ================= Input ================= //

export interface RouterInput {
  router: ClerkHostRouter;
}

// ================= Events ================= //

export type RouterPushEvent = { type: 'push'; path: string };
export type RouterReplaceEvent = { type: 'replace'; path: string };
export type RouterSyncEvent = { type: 'sync' };

export type RouterEvent = RouterPushEvent | RouterReplaceEvent | RouterSyncEvent;
