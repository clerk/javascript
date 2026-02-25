export type AppVersionSupportStatus = {
  isSupported: boolean;
  minimumVersion: string | null;
  updateURL: string | null;
};

export const defaultAppVersionSupportStatus = (): AppVersionSupportStatus => ({
  isSupported: true,
  minimumVersion: null,
  updateURL: null,
});
