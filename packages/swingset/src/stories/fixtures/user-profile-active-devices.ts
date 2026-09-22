import type { UserProfileDevice } from '@clerk/mosaic/features/user-profile/user-profile-active-devices.types';
import { useRef, useState } from 'react';

export const userProfileDevices: UserProfileDevice[] = [
  {
    id: 'current',
    name: 'Safari on macOS',
    description: 'Salt Lake City, UT, United States',
    type: 'desktop',
    isCurrent: true,
    lastActive: 'just now',
    model: 'Macbook Pro',
    browser: 'Safari 18.4',
    ipAddress: '2600:100e:b10b:787b:e8ae:6e75',
    location: '🇺🇸 Salt Lake City, UT, United States',
    signedInAt: 'July 5th, 2026',
  },
  {
    id: 'mobile',
    name: 'Safari on iOS',
    description: 'Last seen 2 weeks ago · Orem, UT, United States',
    type: 'mobile',
    lastActive: '4 days ago',
    model: 'iPhone 16 Pro',
    browser: 'Safari 18.4',
    ipAddress: '2600:100e:b10b:787b:e8ae:6e75',
    location: '🇺🇸 Orem, UT, United States',
    signedInAt: 'May 2nd, 2026',
  },
  {
    id: 'desktop',
    name: 'Clerk App on macOS',
    description: 'Last seen May 14th, 2026 · San Francisco, CA, United States',
    type: 'desktop',
    lastActive: 'May 14th, 2026',
    model: 'Macbook Air',
    browser: 'Chrome 150.0.0.0',
    ipAddress: '192.168.1.24',
    location: '🇺🇸 San Francisco, CA, United States',
    signedInAt: 'March 3rd, 2026',
  },
];

export const userProfileImpersonationDevices: UserProfileDevice[] = [
  {
    id: 'current',
    name: 'Chrome on macOS',
    description: 'San Francisco, CA, United States',
    type: 'desktop',
    isCurrent: true,
    isImpersonationDevice: true,
    lastActive: 'just now',
    model: 'Macbook Pro',
    browser: 'Chrome 150.0.0.0',
    ipAddress: '192.168.1.24',
    location: '🇺🇸 San Francisco, CA, United States',
    signedInAt: 'July 5th, 2026',
  },
  {
    id: 'user',
    name: 'Safari on iOS',
    description: 'Last seen 2 weeks ago · Orem, UT, United States',
    type: 'mobile',
    isUserDevice: true,
    lastActive: '4 days ago',
    model: 'iPhone 16 Pro',
    browser: 'Safari 18.4',
    ipAddress: '2600:100e:b10b:787b:e8ae:6e75',
    location: '🇺🇸 Orem, UT, United States',
    signedInAt: 'May 2nd, 2026',
  },
];

export interface UserProfileActiveDevicesFixtureOptions {
  devices?: UserProfileDevice[];
  /** How long a sign out takes, so the pending button and its spinner are visible. */
  latency?: number;
  /** Rejects the first sign out of each kind with this message, then succeeds. */
  failWith?: string;
}

export function useUserProfileActiveDevicesFixture({
  devices: initialDevices = userProfileDevices,
  latency = 1200,
  failWith,
}: UserProfileActiveDevicesFixtureOptions = {}) {
  const [devices, setDevices] = useState(initialDevices);
  const failed = useRef({ device: false, all: false });

  const settle = async (kind: 'device' | 'all') => {
    await new Promise(resolve => setTimeout(resolve, latency));
    if (failWith && !failed.current[kind]) {
      failed.current[kind] = true;
      throw new Error(failWith);
    }
  };

  return {
    devices,
    onSignOutDevice: async (id: string) => {
      await settle('device');
      setDevices(current => current.filter(device => device.id !== id));
    },
    onSignOutAllOtherDevices: async () => {
      await settle('all');
      setDevices(current => current.filter(device => device.isCurrent));
    },
  };
}
