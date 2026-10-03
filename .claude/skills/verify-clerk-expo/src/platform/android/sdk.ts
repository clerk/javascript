import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { DoctorCheck } from '../../core/types.ts';

export const STUDIO_JBR = '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
const MIN_JAVA = 21;

export function sdkRoot(env: Readonly<Record<string, string | undefined>> = process.env): string {
  return env.ANDROID_HOME ?? env.ANDROID_SDK_ROOT ?? join(homedir(), 'Library', 'Android', 'sdk');
}

export function sdkTool(tool: 'adb' | 'emulator', env: Readonly<Record<string, string | undefined>> = process.env): string {
  const path = join(sdkRoot(env), tool === 'adb' ? 'platform-tools' : 'emulator', tool);
  return existsSync(path) ? path : tool;
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

export type JavaHome = { readonly ok: true; readonly home: string; readonly detail: string } | { readonly ok: false; readonly detail: string; readonly fix: string };

export function resolveJavaHome(env: Readonly<Record<string, string | undefined>> = process.env, studioJbr: string = STUDIO_JBR): JavaHome {
  const studio = javaMajor(studioJbr);
  const fix =
    studio !== null && studio >= MIN_JAVA
      ? `export JAVA_HOME="${studioJbr}"`
      : `install Android Studio (its bundled JBR at ${studioJbr} is Java ${MIN_JAVA}) or a Java ${MIN_JAVA} JDK, then export JAVA_HOME to it`;
  const requested = env.JAVA_HOME;
  if (requested !== undefined && requested !== '') {
    const major = javaMajor(requested);
    if (major !== null && major >= MIN_JAVA) return { ok: true, home: requested, detail: `Java ${major} from JAVA_HOME (${requested})` };
    return { ok: false, detail: `JAVA_HOME is ${major === null ? 'not a JDK' : `Java ${major}`} (${requested}); the Android build needs Java ${MIN_JAVA}`, fix };
  }
  if (studio !== null && studio >= MIN_JAVA) return { ok: true, home: studioJbr, detail: `Java ${studio} from the Android Studio JBR` };
  return { ok: false, detail: `JAVA_HOME is unset and there is no Java ${MIN_JAVA} Android Studio JBR`, fix };
}

export function jdkCheck(env: Readonly<Record<string, string | undefined>> = process.env, studioJbr: string = STUDIO_JBR): DoctorCheck {
  const java = resolveJavaHome(env, studioJbr);
  return java.ok ? { id: 'jdk', ok: true, detail: java.detail } : { id: 'jdk', ok: false, detail: java.detail, fix: java.fix };
}
