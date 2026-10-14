import type { CommandLine } from '../../core/exec.ts';
import { AVD_NAME } from './sdk.ts';

export const RECORD_SIZE = '720x1608';
export const LOG_FILTER = ['ClerkVerify:V', 'ClerkLog:V', 'OkHttp:V', 'ReactNativeJS:V', 'AndroidRuntime:E', '*:S'];

const SOFTWARE_GPU = ['-gpu', 'swiftshader_indirect'];
const WITHOUT_THE_180_SECOND_CAP = ['--time-limit', '0'];
const SHELL_WRITABLE_BEFORE_STORAGE_MOUNTS = '/data/local/tmp';
const INTERRUPT_ON_THE_DEVICE_SO_THE_MP4_GETS_ITS_MOOV_ATOM = 'pkill -INT screenrecord';

export function emulatorArgs(port: number, os: NodeJS.Platform): readonly string[] {
  return ['-avd', AVD_NAME, '-read-only', '-no-window', '-no-audio', '-no-boot-anim', ...(os === 'linux' ? SOFTWARE_GPU : []), '-port', String(port)];
}

export const LANE_SETTINGS = [
  ['window_animation_scale', '0'],
  ['transition_animation_scale', '0'],
  ['animator_duration_scale', '0'],
  ['hide_error_dialogs', '1'],
] as const;

export const laneSettingsCommand = (): string => LANE_SETTINGS.map(([name, value]) => `settings put global ${name} ${value}`).join(' && ');

export const laneSettingsReadCommand = (): string => LANE_SETTINGS.map(([name]) => `settings get global ${name}`).join(' && ');

export function laneSettingsHold(read: string): boolean {
  const values = read.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  return values.length === LANE_SETTINGS.length && LANE_SETTINGS.every(([, wanted], index) => Number(values[index]) === Number(wanted));
}

export const installArgs = (apk: string): readonly string[] => ['install', '-r', '-t', apk];

export function logFilter(extraPredicate?: string | null): readonly string[] {
  const extra = extraPredicate?.split(/\s+/).filter((spec) => spec.length > 0) ?? [];
  return [...LOG_FILTER.slice(0, -1), ...extra, '*:S'];
}

export function logcatSince(since: Date): string {
  return (since.getTime() / 1000).toFixed(3);
}

export const logcatArgs = (since: Date, extraPredicate?: string | null): readonly string[] => ['logcat', '-d', '-v', 'threadtime', '-T', logcatSince(since), ...logFilter(extraPredicate)];

export const recordingOnDevice = (name: string): string => `${SHELL_WRITABLE_BEFORE_STORAGE_MOUNTS}/verify-${name}.mp4`;

export const LANE_READY = 'lane-ready';
export const LANE_FAILED = 'lane-failed';

export const waitForLane = (work: string): CommandLine => ({
  command: 'sh',
  args: ['-c', `until [ -f "$0/${LANE_READY}" ]; do if [ -f "$0/${LANE_FAILED}" ]; then echo "the emulator did not boot: $(cat "$0/${LANE_FAILED}")"; exit 1; fi; sleep 1; done`, work],
});

export const screenrecordArgs = (deviceFile: string): readonly string[] => ['shell', 'screenrecord', '--size', RECORD_SIZE, ...WITHOUT_THE_180_SECOND_CAP, deviceFile];

export const stopScreenrecordArgs: readonly string[] = ['shell', `${INTERRUPT_ON_THE_DEVICE_SO_THE_MP4_GETS_ITS_MOOV_ATOM}; i=0; while pidof screenrecord > /dev/null && [ $i -lt 100 ]; do sleep 0.2; i=$((i+1)); done`];

export const collectRecordingArgs = (deviceFile: string, file: string): readonly (readonly string[])[] => [
  ['pull', deviceFile, file],
  ['shell', 'rm', '-f', deviceFile],
];
