/**
 * One-time runtime disclosure that Clerk collects telemetry from development instances.
 *
 * This module replaces the previous `postinstall` script that ran on every install of
 * `@clerk/shared`. Running disclosure at runtime (rather than via npm lifecycle scripts)
 * keeps published packages free of install-time code, which is a common supply-chain
 * concern, and only surfaces the notice in environments where telemetry actually fires.
 *
 * The notice is shown at most once per machine. The marker is persisted to:
 *   - `localStorage` in browsers
 *   - the same env-paths style config file the previous postinstall wrote to on Node,
 *     so users who already saw the notice via postinstall do not see it again
 *   - nowhere in environments without either (Workers, edge runtimes); the notice is
 *     simply skipped there
 *
 * All work is wrapped in try/catch. Failure to display or persist the notice must never
 * affect the SDK.
 */

import { isTruthy } from '../underscore';

const TELEMETRY_NOTICE_VERSION = 1;
const STORAGE_KEY = 'clerk_telemetry_notice_v1';
const CONFIG_DIR_NAME = 'clerk';
const CONFIG_FILE_NAME = 'config.json';

const NOTICE_LINES = [
  'Attention: Clerk collects telemetry data from its SDKs when connected to development instances.',
  "The data collected is used to inform Clerk's product roadmap.",
  'To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry.',
];

interface NoticeStore {
  hasSeen(): Promise<boolean>;
  markSeen(): Promise<void>;
}

const CI_ENV_VARS = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'BUILD_NUMBER',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'BUILDKITE',
  'JENKINS_URL',
  'TF_BUILD',
  'DRONE',
  'CODEBUILD_BUILD_ID',
];

function isCI(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }
  return CI_ENV_VARS.some(name => isTruthy(process.env[name]));
}

function isHeadlessBrowser(): boolean {
  return typeof window !== 'undefined' && Boolean(window?.navigator?.webdriver);
}

function hasUsableLocalStorage(): boolean {
  try {
    return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

class BrowserNoticeStore implements NoticeStore {
  async hasSeen(): Promise<boolean> {
    const value = globalThis.localStorage.getItem(STORAGE_KEY);
    return parseInt(value ?? '0', 10) >= TELEMETRY_NOTICE_VERSION;
  }

  async markSeen(): Promise<void> {
    globalThis.localStorage.setItem(STORAGE_KEY, String(TELEMETRY_NOTICE_VERSION));
  }
}

class NodeNoticeStore implements NoticeStore {
  #pathPromise: Promise<{ dir: string; file: string } | null> | null = null;

  async #getPaths(): Promise<{ dir: string; file: string } | null> {
    if (!this.#pathPromise) {
      this.#pathPromise = (async () => {
        try {
          const os = await importNodeModule<typeof import('node:os')>('node:os');
          const path = await importNodeModule<typeof import('node:path')>('node:path');
          const homedir = os.homedir();
          let dir: string;
          switch (process.platform) {
            case 'darwin':
              dir = path.join(homedir, 'Library', 'Preferences', CONFIG_DIR_NAME);
              break;
            case 'win32': {
              // eslint-disable-next-line turbo/no-undeclared-env-vars
              const appData = process.env.APPDATA ?? path.join(homedir, 'AppData', 'Roaming');
              dir = path.join(appData, CONFIG_DIR_NAME, 'Config');
              break;
            }
            default: {
              // eslint-disable-next-line turbo/no-undeclared-env-vars
              const xdg = process.env.XDG_CONFIG_HOME ?? path.join(homedir, '.config');
              dir = path.join(xdg, CONFIG_DIR_NAME);
            }
          }
          return { dir, file: path.join(dir, CONFIG_FILE_NAME) };
        } catch {
          return null;
        }
      })();
    }
    return this.#pathPromise;
  }

  async hasSeen(): Promise<boolean> {
    const paths = await this.#getPaths();
    if (!paths) {
      return false;
    }
    try {
      const fs = await importNodeModule<typeof import('node:fs/promises')>('node:fs/promises');
      const raw = await fs.readFile(paths.file, 'utf8');
      const parsed = JSON.parse(raw) as { telemetryNoticeVersion?: string | number };
      return parseInt(String(parsed.telemetryNoticeVersion ?? '0'), 10) >= TELEMETRY_NOTICE_VERSION;
    } catch {
      return false;
    }
  }

  async markSeen(): Promise<void> {
    const paths = await this.#getPaths();
    if (!paths) {
      return;
    }
    const fs = await importNodeModule<typeof import('node:fs/promises')>('node:fs/promises');
    await fs.mkdir(paths.dir, { recursive: true });
    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(await fs.readFile(paths.file, 'utf8')) as Record<string, unknown>;
    } catch {
      // file missing or unreadable
    }
    existing.telemetryNoticeVersion = TELEMETRY_NOTICE_VERSION;
    await fs.writeFile(paths.file, JSON.stringify(existing, null, '\t'));
  }
}

/**
 * Loads a Node built-in module without exposing the import to static bundler analysis.
 * Bundlers that target the browser (webpack, Rspack) would otherwise fail to compile the
 * `node:fs/promises` / `node:os` / `node:path` literals even though the import is only
 * reachable in a Node runtime.
 */
const importNodeModule = new Function('id', 'return import(id)') as <T = unknown>(id: string) => Promise<T>;

function pickStore(): NoticeStore | null {
  if (hasUsableLocalStorage()) {
    return new BrowserNoticeStore();
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    return new NodeNoticeStore();
  }
  return null;
}

function printNotice(): void {
  if (typeof console === 'undefined' || typeof console.log !== 'function') {
    return;
  }
  for (const line of NOTICE_LINES) {
    console.log(line);
  }
  console.log('');
}

export type MaybeShowTelemetryNoticeOptions = {
  /**
   * Skip the notice entirely. Used when the caller has already determined that no
   * telemetry will be sent (e.g. opt-out, non-development instance), in which case
   * there is nothing to disclose.
   */
  skip?: boolean;
};

let inFlight: Promise<void> | null = null;

/**
 * Display the one-time telemetry disclosure if it has not been shown on this machine.
 *
 * Safe to call multiple times: subsequent calls within the same process are deduped,
 * and the persistence marker prevents re-display across processes. Never throws.
 */
export function maybeShowTelemetryNotice(options: MaybeShowTelemetryNoticeOptions = {}): Promise<void> {
  if (options.skip) {
    return Promise.resolve();
  }
  if (inFlight) {
    return inFlight;
  }
  inFlight = (async () => {
    try {
      if (isCI() || isHeadlessBrowser()) {
        return;
      }
      const store = pickStore();
      if (!store) {
        return;
      }
      if (await store.hasSeen()) {
        return;
      }
      printNotice();
      await store.markSeen();
    } catch {
      // never let disclosure break the SDK
    }
  })();
  return inFlight;
}

/**
 * Test-only: reset the in-process dedupe so the next call re-runs the gating logic.
 *
 * @internal
 */
export function __resetTelemetryNoticeForTests(): void {
  inFlight = null;
}
