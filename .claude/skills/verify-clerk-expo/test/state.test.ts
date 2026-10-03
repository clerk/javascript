import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Secret } from '../src/core/secret.ts';
import { encodeLaunchArguments, parseVerifyState } from '../src/core/state.ts';
import type { HostLaunch, LaunchId, PublishableKey, RunId, StorageScope } from '../src/core/types.ts';

const HOST_LINE =
  'verify {"environmentLoaded":true,"launchId":"abc123","lastError":null,"orgId":null,"pendingTasks":[],"runId":"r20261002-141210-7c1e","screen":"auth","sessionId":null,"sessionStatus":null,"signInStatus":null,"signUpStatus":null,"signedIn":false,"ticket":"none","userId":null,"v":1}';

const launch: HostLaunch<string> = {
  verifyPublishableKey: 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey,
  verifyRunId: 'r20261002-141210-7c1e' as RunId,
  verifyStorageScope: '0011aabb' as StorageScope,
  verifyLaunchId: 'ffee0011' as LaunchId,
  verifyScreen: 'auth',
};

describe('parseVerifyState', () => {
  it('reads the line the E2EHost footer renders', () => {
    const state = parseVerifyState(HOST_LINE);
    assert.equal(state.screen, 'auth');
    assert.equal(state.launchId, 'abc123');
    assert.equal(state.ticket, 'none');
    assert.deepEqual(state.pendingTasks, []);
  });

  it('rejects a host on another contract version', () => {
    assert.throws(() => parseVerifyState(HOST_LINE.replace('"v":1', '"v":2')), { code: 'HOST_CONTRACT_MISMATCH', message: /v2/ });
  });

  it('rejects text that is not a VerifyState', () => {
    assert.throws(() => parseVerifyState('verify not json'), { code: 'HOST_CONTRACT_MISMATCH' });
    assert.throws(() => parseVerifyState(HOST_LINE.replace('"ticket":"none"', '"ticket":"maybe"')), { code: 'HOST_CONTRACT_MISMATCH' });
  });
});

describe('encodeLaunchArguments', () => {
  it('encodes iOS launch arguments and Android string extras', () => {
    assert.deepEqual(encodeLaunchArguments('ios', launch), [
      '-verifyPublishableKey', launch.verifyPublishableKey,
      '-verifyRunId', launch.verifyRunId,
      '-verifyStorageScope', '0011aabb',
      '-verifyLaunchId', 'ffee0011',
      '-verifyScreen', 'auth',
    ]);
    assert.deepEqual(encodeLaunchArguments('android', launch).slice(0, 3), ['--es', 'verifyPublishableKey', launch.verifyPublishableKey]);
  });

  it('rejects values iOS would parse as a property list', () => {
    for (const value of ['(a)', '{a=b}', '<data>', '"quoted"']) {
      assert.throws(() => encodeLaunchArguments('ios', { ...launch, verifyScreen: value }), { code: 'USAGE', message: /property list/ }, value);
    }
    assert.throws(() => encodeLaunchArguments('ios', { ...launch, verifyStorageScope: '{scope}' as StorageScope }), { code: 'USAGE' });
  });

  it('reads the ticket only through Secret.use', () => {
    const args = encodeLaunchArguments('ios', { ...launch, verifySignInTicket: new Secret('ticket', 'tkt_unit_value_123') });
    assert.deepEqual(args.slice(-2), ['-verifySignInTicket', 'tkt_unit_value_123']);
  });
});
