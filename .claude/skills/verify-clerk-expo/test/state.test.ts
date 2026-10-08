import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Secret } from '../src/core/secret.ts';
import { encodeLaunchArguments } from '../src/core/state.ts';
import type { HostLaunch, LaunchId, PublishableKey, RunId, StorageScope } from '../src/core/types.ts';

const launch: HostLaunch = {
  verifyPublishableKey: 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey,
  verifyRunId: 'r20261002-141210-7c1e' as RunId,
  verifyStorageScope: '0011aabb' as StorageScope,
  verifyLaunchId: 'ffee0011' as LaunchId,
};

describe('encodeLaunchArguments', () => {
  it('encodes iOS launch arguments and Android string extras', () => {
    assert.deepEqual(encodeLaunchArguments('ios', launch), [
      '-verifyPublishableKey', launch.verifyPublishableKey,
      '-verifyRunId', launch.verifyRunId,
      '-verifyStorageScope', '0011aabb',
      '-verifyLaunchId', 'ffee0011',
    ]);
    assert.deepEqual(encodeLaunchArguments('android', launch).slice(0, 3), ['--es', 'verifyPublishableKey', launch.verifyPublishableKey]);
  });

  it('rejects values iOS would parse as a property list', () => {
    for (const value of ['(a)', '{a=b}', '<data>', '"quoted"']) {
      assert.throws(() => encodeLaunchArguments('ios', { ...launch, verifyInitialIdentifier: value }), { code: 'USAGE', message: /property list/ }, value);
    }
    assert.throws(() => encodeLaunchArguments('ios', { ...launch, verifyStorageScope: '{scope}' as StorageScope }), { code: 'USAGE' });
  });

  it('carries an initial identifier to either platform, and nothing for a launch that names none', () => {
    const withIdentifier: HostLaunch = { ...launch, verifyInitialIdentifier: '+12015550100' };
    assert.deepEqual(encodeLaunchArguments('ios', withIdentifier).slice(-2), ['-verifyInitialIdentifier', '+12015550100']);
    assert.deepEqual(encodeLaunchArguments('android', withIdentifier).slice(-3), ['--es', 'verifyInitialIdentifier', '+12015550100']);
    assert.equal(encodeLaunchArguments('android', launch).includes('verifyInitialIdentifier'), false);
    assert.throws(() => encodeLaunchArguments('android', { ...launch, verifyInitialIdentifier: '' }), { code: 'USAGE', message: 'launch input verifyInitialIdentifier is empty' });
  });

  it('reads the ticket only through Secret.use', () => {
    const args = encodeLaunchArguments('ios', { ...launch, verifySignInTicket: new Secret('ticket', 'tkt_unit_value_123') });
    assert.deepEqual(args.slice(-2), ['-verifySignInTicket', 'tkt_unit_value_123']);
  });
});
