export type ActiveDeviceModel = {
  scopeKey: string;
  canRun: () => boolean;
  id: string;
  isCurrent: boolean;
  isCurrentlyImpersonating: boolean;
  isImpersonationSession: boolean;
  title: string;
  browser: string;
  location: string | null;
  ipAddress: string | undefined;
  isMobile: boolean | undefined;
  lastActiveAt: number | undefined;
  revokeSession: (canContinue?: () => boolean) => Promise<void>;
};

export type ActiveDevicesModel = {
  scopeKey: string;
  isLoading: boolean | undefined;
  devices: ActiveDeviceModel[];
};

export type ActiveDeviceData = Omit<ActiveDeviceModel, 'revokeSession' | 'lastActiveAt' | 'scopeKey' | 'canRun'> & {
  lastActive: string;
  error: string | undefined;
  isLoading: boolean;
  revoke: () => Promise<void>;
};
