import type { VerifyFailure } from './launch';

export type VerifyTicket = 'none' | 'pending' | 'succeeded' | 'failed';

export type VerifyState = {
  v: 1;
  runId: string | null;
  launchId: string | null;
  screen: string;
  environmentLoaded: boolean;
  signedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  sessionStatus: 'active' | 'pending' | null;
  pendingTasks: string[];
  orgId: string | null;
  signInStatus: string | null;
  signUpStatus: string | null;
  ticket: VerifyTicket;
  lastError: VerifyFailure | null;
  extra: Record<string, string | number | boolean | null>;
};

function sortedKeys(_key: string, value: unknown) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export function verifyStateJson(state: VerifyState): string {
  return JSON.stringify(state, sortedKeys);
}
