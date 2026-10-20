import type { SessionActivity } from '@clerk/shared/types';

export type SessionScope = Readonly<{
  instanceKey: string;
  userId: string;
  sessionId: string;
}>;

export type ActiveDeviceSession = Readonly<{
  id: string;
  status: string;
  lastActiveAt: number | null;
  expireAt: number;
  abandonAt: number;
  hasActor: boolean;
  latestActivity: Readonly<SessionActivity>;
}>;

export type Sessions = readonly ActiveDeviceSession[];

export type SessionsTransport = Readonly<{
  read: (signal: AbortSignal) => Promise<Sessions>;
  revoke: (id: string, signal: AbortSignal) => Promise<void>;
}>;

export type LoomHydration = Readonly<{
  version: 1;
  scope: SessionScope;
  sessions: Sessions;
  updatedAt: number;
}>;
