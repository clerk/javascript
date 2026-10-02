import { mobile } from '@e2e-dev/mobile';
import type { E2EConfig } from 'e2e';

const app = { bundleId: 'com.clerk.exponativebuildfixture' };
const devices = process.env.CLERK_TEST_DEVICES?.split(',');

export default {
  tests: 'tests/expo-native/flows/*.e2e.ts',
  targets: [
    { name: 'ios', engine: mobile({ platform: 'ios', device: devices }), app },
    { name: 'android', engine: mobile({ platform: 'android', device: devices }), app },
  ],
  workers: devices?.length ?? 1,
  timeout: 300_000,
} satisfies E2EConfig;
