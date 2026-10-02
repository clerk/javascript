import type { Device } from '@e2e-dev/mobile';
import type { TestFixtures } from 'e2e';

export type DeviceFixtures = TestFixtures & { device: Device };

export type TestUser = { email: string; password: string };
