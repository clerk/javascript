export type ForceUpdateReason =
  | 'supported'
  | 'no_policy'
  | 'missing_current_version'
  | 'invalid_current_version'
  | 'invalid_minimum_version'
  | 'below_minimum'
  | 'server_rejected';

export type ForceUpdateStatus = {
  isSupported: boolean;
  currentVersion: string | null;
  minimumVersion: string | null;
  updateURL: string | null;
  reason: ForceUpdateReason;
};

export const defaultForceUpdateStatus = (): ForceUpdateStatus => ({
  isSupported: true,
  currentVersion: null,
  minimumVersion: null,
  updateURL: null,
  reason: 'supported',
});
