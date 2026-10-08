import type { Inputs, TestApp } from '../specs/support/inputs.ts';
import type { PublishableKey, RunId } from '../specs/support/types.ts';

export const SAMPLE_RUN = 'r20261002-141210-7c1e' as RunId;
export const SAMPLE_PUBLISHABLE_KEY = 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey;

export const IOS_APP: TestApp = { platforms: ['ios'], id: () => 'com.clerk.sample', entry: () => ({ kind: 'binary' }) };

export const BOTH_PLATFORMS_APP: TestApp = {
  platforms: ['ios', 'android'],
  id: (platform) => (platform === 'ios' ? 'com.clerk.sample' : 'com.clerk.sample.android'),
  entry: (_platform, devServer) => (devServer === null ? { kind: 'binary' } : { kind: 'dev-client', launchArguments: ['--initialUrl', devServer], openLink: null, androidActivity: '.MainActivity' }),
};

export const SAMPLE_INPUTS: Inputs = {
  target: { platform: 'ios', device: { kind: 'local', id: 'FDF0CD9E-CF9E-42B6-AE3A-116A665F7EF3' }, session: 'verify-ios-abc', build: { path: null, devServer: null } },
  clerk: { publishableKey: SAMPLE_PUBLISHABLE_KEY, access: { kind: 'stand-in', url: 'http://127.0.0.1:4010/v1', tokenFile: '/package/.verify/scratch/r/broker-token' } },
  run: SAMPLE_RUN,
};
