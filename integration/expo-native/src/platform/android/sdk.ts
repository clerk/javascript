import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import type { Availability, DoctorCheck } from '../../core/types.ts';

export const AVD_NAME = 'Clerk_Verify_Pixel';
const IMAGE_API = 36;
const IMAGE_TAG = 'google_apis';
const MIN_JAVA = 21;

type Env = Readonly<Record<string, string | undefined>>;

export interface Machine {
  readonly os: NodeJS.Platform;
  readonly arch: string;
  readonly home: string;
  readonly env: Env;
  readonly kvm: string;
}

export const thisMachine = (): Machine => ({ os: process.platform, arch: process.arch, home: homedir(), env: process.env, kvm: '/dev/kvm' });

const emulatorIn = (root: string) => join(root, 'emulator', 'emulator');
const adbIn = (root: string) => join(root, 'platform-tools', 'adb');

function sdkCandidates(machine: Machine): readonly string[] {
  const fromPath = (machine.env.PATH ?? '')
    .split(delimiter)
    .filter((entry) => /[\\/](platform-tools|emulator)[\\/]?$/.test(entry))
    .map((entry) => dirname(entry.replace(/[\\/]$/, '')));
  const byDefault = machine.os === 'darwin' ? join(machine.home, 'Library', 'Android', 'sdk') : join(machine.home, 'Android', 'Sdk');
  return [...new Set([machine.env.ANDROID_HOME, machine.env.ANDROID_SDK_ROOT, byDefault, ...fromPath].filter((root): root is string => root !== undefined && root !== ''))];
}

export function sdkRoot(machine: Machine = thisMachine()): string {
  const candidates = sdkCandidates(machine);
  return candidates.find((root) => existsSync(emulatorIn(root)) && existsSync(adbIn(root))) ?? candidates[0]!;
}

export function sdkTool(tool: 'adb' | 'emulator', machine: Machine = thisMachine()): string {
  const path = tool === 'adb' ? adbIn(sdkRoot(machine)) : emulatorIn(sdkRoot(machine));
  return existsSync(path) ? path : tool;
}

const imageOf = (abi: string): string => `system-images;android-${IMAGE_API};${IMAGE_TAG};${abi}`;
const dirOf = (image: string): string => `${image.split(';').join('/')}/`;

function abiOf(machine: Machine): string {
  const own = machine.arch === 'arm64' ? 'arm64-v8a' : 'x86_64';
  const other = own === 'x86_64' ? 'arm64-v8a' : 'x86_64';
  const installed = machine.os === 'darwin' ? [own, other].find((abi) => existsSync(join(sdkRoot(machine), dirOf(imageOf(abi)), 'system.img'))) : undefined;
  return installed ?? own;
}

export const systemImage = (machine: Machine = thisMachine()): string => imageOf(abiOf(machine));

const avdHome = (machine: Machine): string => machine.env.ANDROID_AVD_HOME || join(machine.env.ANDROID_USER_HOME || join(machine.home, '.android'), 'avd');
const avdPointer = (machine: Machine): string => join(avdHome(machine), `${AVD_NAME}.ini`);

function laneAvdImageDirInSdk(machine: Machine): string | null {
  try {
    const dir = /^path\s*=\s*(.+)$/m.exec(readFileSync(avdPointer(machine), 'utf8'))?.[1]?.trim() ?? join(avdHome(machine), `${AVD_NAME}.avd`);
    return /^image\.sysdir\.1\s*=\s*(.+)$/m.exec(readFileSync(join(dir, 'config.ini'), 'utf8'))?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

export function ensureLaneAvd(machine: Machine = thisMachine()): 'exists' | 'created' {
  if (existsSync(avdPointer(machine))) return 'exists';
  const dir = join(avdHome(machine), `${AVD_NAME}.avd`);
  mkdirSync(dir, { recursive: true });
  const abi = abiOf(machine);
  const config = {
    AvdId: AVD_NAME,
    'PlayStore.enabled': 'false',
    'abi.type': abi,
    'avd.ini.encoding': 'UTF-8',
    'disk.dataPartition.size': '6G',
    'hw.cpu.arch': abi === 'x86_64' ? 'x86_64' : 'arm64',
    'hw.cpu.ncore': '4',
    'hw.gpu.enabled': 'yes',
    'hw.gpu.mode': 'auto',
    'hw.keyboard': 'yes',
    'hw.lcd.density': '480',
    'hw.lcd.height': '2856',
    'hw.lcd.width': '1280',
    'hw.ramSize': '2048',
    'image.sysdir.1': dirOf(imageOf(abi)),
    'tag.display': 'Google APIs',
    'tag.id': IMAGE_TAG,
    'vm.heapSize': '256',
  };
  writeFileSync(join(dir, 'config.ini'), Object.entries(config).map(([key, value]) => `${key}=${value}\n`).join(''));
  writeFileSync(avdPointer(machine), `avd.ini.encoding=UTF-8\npath=${dir}\npath.rel=avd/${AVD_NAME}.avd\ntarget=android-${IMAGE_API}\n`);
  return 'created';
}

function opensReadWrite(path: string): boolean {
  try {
    closeSync(openSync(path, 'r+'));
    return true;
  } catch {
    return false;
  }
}

const KVM_RULE = `echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666", OPTIONS+="static_node=kvm"' | sudo tee /etc/udev/rules.d/99-kvm4all.rules && sudo udevadm control --reload-rules && sudo udevadm trigger --name-match=kvm`;

export function localAvailability(machine: Machine = thisMachine()): Availability {
  if (machine.os !== 'darwin' && machine.os !== 'linux') return { usable: false, why: `the lane emulator runs on macOS and Linux, and this machine runs ${machine.os}` };
  if (machine.os === 'linux' && !existsSync(machine.kvm)) return { usable: false, why: `there is no ${machine.kvm}, so this machine has no hardware virtualization for the emulator` };
  const root = sdkRoot(machine);
  if (!existsSync(emulatorIn(root)) || !existsSync(adbIn(root))) {
    return {
      usable: false,
      why: `no Android SDK with an emulator and adb (looked in ${sdkCandidates(machine).join(', ')})`,
      fix: 'install the Android SDK emulator and platform-tools and set ANDROID_HOME to the SDK',
    };
  }
  const named = laneAvdImageDirInSdk(machine);
  const image = named ?? dirOf(systemImage(machine));
  if (!existsSync(join(root, image, 'system.img'))) {
    const wanted = image.replace(/\/$/, '').split('/').join(';');
    return { usable: false, why: `the SDK at ${root} has no system image ${wanted}${named === null ? '' : `, which the ${AVD_NAME} AVD names`}`, fix: `sdkmanager "${wanted}", or install it from Android Studio's SDK Manager` };
  }
  if (machine.os === 'linux' && !opensReadWrite(machine.kvm)) {
    return { usable: false, why: `this user cannot open ${machine.kvm} for reading and writing, so the emulator would have no hardware acceleration`, fix: KVM_RULE };
  }
  return { usable: true, why: machine.os === 'linux' ? `this machine runs the emulator itself: ${machine.kvm} opens for reading and writing and the SDK at ${root} has the system image` : `this Mac runs the emulator itself, from the SDK at ${root}` };
}

function javaMajor(home: string): number | null {
  try {
    const release = readFileSync(join(home, 'release'), 'utf8');
    const version = /^JAVA_VERSION="([^"]+)"/m.exec(release)?.[1];
    if (version === undefined) return null;
    const major = Number(version.startsWith('1.') ? version.split('.')[1] : version.split(/[.+-]/)[0]);
    return Number.isNaN(major) ? null : major;
  } catch {
    return null;
  }
}

const STUDIO_JBR = process.platform === 'darwin' ? '/Applications/Android Studio.app/Contents/jbr/Contents/Home' : null;

export type JavaHome = { readonly ok: true; readonly home: string; readonly detail: string } | { readonly ok: false; readonly detail: string; readonly fix: string };

export function resolveJavaHome(env: Env = process.env, studioJbr: string | null = STUDIO_JBR): JavaHome {
  const studio = studioJbr === null ? null : javaMajor(studioJbr);
  const fix =
    studioJbr !== null && studio !== null && studio >= MIN_JAVA
      ? `export JAVA_HOME="${studioJbr}"`
      : studioJbr === null
        ? `install a Java ${MIN_JAVA} JDK and export JAVA_HOME to it`
        : `install Android Studio (its bundled JBR at ${studioJbr} is Java ${MIN_JAVA}) or a Java ${MIN_JAVA} JDK, then export JAVA_HOME to it`;
  const requested = env.JAVA_HOME;
  if (requested !== undefined && requested !== '') {
    const major = javaMajor(requested);
    if (major !== null && major >= MIN_JAVA) return { ok: true, home: requested, detail: `Java ${major} from JAVA_HOME (${requested})` };
    return { ok: false, detail: `JAVA_HOME is ${major === null ? 'not a JDK' : `Java ${major}`} (${requested}); the Android build needs Java ${MIN_JAVA}`, fix };
  }
  if (studioJbr !== null && studio !== null && studio >= MIN_JAVA) return { ok: true, home: studioJbr, detail: `Java ${studio} from the Android Studio JBR` };
  return { ok: false, detail: `JAVA_HOME is unset${studioJbr === null ? '' : ` and there is no Java ${MIN_JAVA} Android Studio JBR`}`, fix };
}

export function jdkCheck(env: Env = process.env, studioJbr: string | null = STUDIO_JBR): DoctorCheck {
  const java = resolveJavaHome(env, studioJbr);
  return java.ok ? { id: 'jdk', ok: true, detail: java.detail } : { id: 'jdk', ok: false, detail: java.detail, fix: java.fix };
}
