import { fileURLToPath } from 'node:url';
import type { CommandLine } from '@clerk/internal-mobile-e2e/core/exec';
import type { SessionDevice, SessionDeviceFactory } from '@clerk/internal-mobile-e2e/core/remote/protocol';
import type { Platform } from '@clerk/internal-mobile-e2e/core/types';
import { artifact, buildInputs } from '../fixture.ts';
import {
  collectRecordingArgs,
  installArgs,
  logcatArgs,
  recordingOnDevice,
  screenrecordArgs,
  stopScreenrecordArgs,
  waitForLane,
} from './android/emulator.ts';
import { installApp, recordVideo, showLogs, waitForBoot } from './ios/simulator.ts';

const FIXTURE_BUILD = fileURLToPath(new URL('../fixture.ts', import.meta.url));
const RECORDING = recordingOnDevice('session');

const buildStandalone = (platform: Platform): CommandLine => ({
  command: process.execPath,
  args: [FIXTURE_BUILD, platform],
});

function simulator(udid: string): SessionDevice {
  return {
    inputs: buildInputs('ios', 'standalone'),
    build: () => [buildStandalone('ios'), waitForBoot(udid), installApp(udid, artifact('ios', 'standalone'))],
    record: { start: file => recordVideo(udid, file), startedWhen: 'recording started' },
    logs: (since, predicate) => showLogs(udid, since, predicate),
  };
}

function emulator(serial: string): SessionDevice {
  const adb = (args: readonly string[]): CommandLine => ({ command: 'adb', args: ['-s', serial, ...args] });
  return {
    inputs: buildInputs('android', 'standalone'),
    build: work => [buildStandalone('android'), waitForLane(work), adb(installArgs(artifact('android', 'standalone')))],
    record: {
      start: () => adb(screenrecordArgs(RECORDING)),
      stop: () => [adb(stopScreenrecordArgs)],
      collect: file => collectRecordingArgs(RECORDING, file).map(adb),
    },
    logs: (since, predicate) => adb(logcatArgs(since, predicate)),
  };
}

const sessionDevice: SessionDeviceFactory = ({ id, platform }) => (platform === 'ios' ? simulator(id) : emulator(id));

export default sessionDevice;
