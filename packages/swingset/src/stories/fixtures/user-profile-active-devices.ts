import type { UserProfileDevice } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices.types';
import { useUserProfileActiveDevicesController } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.controller';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosPick, chaosPlace } from '@/lib/chaos';

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

const chaosDevices = [
  {
    name: 'Microsoft Edge on Windows 11',
    model: 'Lenovo ThinkPad X1 Carbon Gen 12',
    browser: 'Microsoft Edge 150.0.3240.92',
  },
  { name: 'Samsung Internet on Android', model: 'Samsung Galaxy Z Fold6', browser: 'Samsung Internet 28.0.1.42' },
  {
    name: 'Firefox Developer Edition on Ubuntu',
    model: 'Framework Laptop 16',
    browser: 'Firefox Developer Edition 152.0b9',
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
  const seed = useChaosFixture(initialDevices, items =>
    items.map((device, index) => ({
      ...device,
      ...chaosPick(chaosDevices, index),
      description: device.isCurrent ? chaosPlace(index) : `Last seen September 28th, 2026 · ${chaosPlace(index)}`,
      location: chaosPlace(index),
    })),
  );
  const [devices, setDevices] = useState(seed);
  const failed = useRef({ device: false, all: false });

  const settle = async (kind: 'device' | 'all') => {
    await new Promise(resolve => setTimeout(resolve, latency));
    if (failWith && !failed.current[kind]) {
      failed.current[kind] = true;
      throw new Error(failWith);
    }
  };

  return useUserProfileActiveDevicesController({
    devices,
    revoke: async (id: string) => {
      await settle('device');
      setDevices(current => current.filter(device => device.id !== id));
    },
    revokeAll: async () => {
      await settle('all');
      setDevices(current => current.filter(device => device.isCurrent));
    },
  });
}
