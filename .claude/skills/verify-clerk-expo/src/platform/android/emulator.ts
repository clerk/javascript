import { AVD_NAME } from './sdk.ts';

export const RECORD_SIZE = '720x1608';
export const LOG_FILTER = ['ClerkVerify:V', 'ClerkLog:V', 'OkHttp:V', 'ReactNativeJS:V', 'AndroidRuntime:E', '*:S'];

const SOFTWARE_GPU = ['-gpu', 'swiftshader_indirect'];
const WITHOUT_THE_180_SECOND_CAP = ['--time-limit', '0'];
const SHELL_WRITABLE_BEFORE_STORAGE_MOUNTS = '/data/local/tmp';

export function emulatorArgs(port: number, os: NodeJS.Platform): readonly string[] {
  return ['-avd', AVD_NAME, '-read-only', '-no-window', '-no-audio', '-no-boot-anim', ...(os === 'linux' ? SOFTWARE_GPU : []), '-port', String(port)];
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

export const screenrecordArgs = (deviceFile: string): readonly string[] => ['shell', 'screenrecord', '--size', RECORD_SIZE, ...WITHOUT_THE_180_SECOND_CAP, deviceFile];
