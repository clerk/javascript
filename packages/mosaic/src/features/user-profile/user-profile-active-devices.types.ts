export interface UserProfileDevice {
  id: string;
  name: string;
  description?: string;
  type: 'desktop' | 'mobile';
  isCurrent?: boolean;
  /** The impersonated user's own device, seen from an impersonation session. */
  isUserDevice?: boolean;
  /** A session an impersonator opened. */
  isImpersonationDevice?: boolean;
  /** How long ago the device was last seen, already phrased: "4 days ago". */
  lastActive?: string;
  /** The device itself, as the session reports it: "Macbook Pro". */
  model?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
  /** When the session on this device began, already formatted. */
  signedInAt?: string;
}
