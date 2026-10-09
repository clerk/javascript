import type { VerifyFailure } from './launch';

export type VerifyTicket = 'none' | 'pending' | 'succeeded' | 'failed';

export type VerifyState = {
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

export function verifyStateJson(state: VerifyState): string {
  return JSON.stringify(state);
}
