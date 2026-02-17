export type ForceUpdateStatus = {
  isSupported: boolean;
  minimumVersion: string | null;
  updateURL: string | null;
};

export const defaultForceUpdateStatus = (): ForceUpdateStatus => ({
  isSupported: true,
  minimumVersion: null,
  updateURL: null,
});
