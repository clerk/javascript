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

export type UserSnapshot = Readonly<{
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
  hasImage: boolean;
  primaryEmailAddressId: string | null;
  emailAddresses: readonly Readonly<{
    id: string;
    emailAddress: string;
    verification: UserVerification | null;
  }>[];
  enterpriseAccounts: readonly Readonly<{
    active: boolean;
    provider: string;
    enterpriseConnection: Readonly<{ name: string; disableAdditionalIdentifications: boolean }> | null;
  }>[];
  passwordEnabled: boolean;
  deleteSelfEnabled: boolean;
  externalAccounts: readonly Readonly<{
    id: string;
    provider: string;
    approvedScopes: string;
    username: string | null;
    emailAddress: string;
    verification: UserVerification | null;
  }>[];
}>;

export type LoomHydration = Readonly<{
  version: 5;
  scope: SessionScope;
  sessions?: Readonly<{ data: Sessions; updatedAt: number }>;
  user?: Readonly<{ data: UserSnapshot; updatedAt: number }>;
  profileSettings?: Readonly<{ data: ProfileSettings; updatedAt: number }>;
}>;

export type ProfileAttribute = Readonly<{
  enabled: boolean;
  required: boolean;
  immutable: boolean;
  usedForFirstFactor: boolean;
  usedForSecondFactor: boolean;
}>;

export type ProfileSettings = Readonly<{
  firstName: Readonly<{ enabled: boolean; required: boolean }>;
  lastName: Readonly<{ enabled: boolean; required: boolean }>;
  username: ProfileAttribute;
  emailAddress: ProfileAttribute;
  passwordEnabled: boolean;
  enterpriseSsoEnabled: boolean;
  providers: readonly Readonly<{ strategy: string; enabled: boolean; name: string; logoUrl: string | null }>[];
}>;

export type ProfileSnapshot = Readonly<{ scope: SessionScope; user: UserSnapshot; settings: ProfileSettings }>;

export type UserVerification = Readonly<{
  status: string | null;
  strategy: string | null;
  expireAt: number | null;
  error: Readonly<{ code: string; longMessage: string }> | null;
}>;

export type ProfileSettingsSeed =
  | Readonly<{ kind: 'ready'; hydration: LoomHydration }>
  | Readonly<{ kind: 'unavailable' }>;

export type PrefetchedProfile = Readonly<{
  hydration: LoomHydration & Readonly<{ user: Readonly<{ data: UserSnapshot; updatedAt: number }> }>;
  settings: Promise<ProfileSettingsSeed>;
}>;
