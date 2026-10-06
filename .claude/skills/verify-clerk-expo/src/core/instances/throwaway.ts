import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEVELOPMENT_USER_LIMIT, REPLACE_AT_USERS, frontendApiHost, type ClerkBackend } from '../clerk.ts';
import { sleep as defaultSleep } from '../exec.ts';
import type { InstanceKeys } from '../keys.ts';
import { Secret } from '../secret.ts';
import { count } from '../state.ts';
import { newEntryId, type Workspace } from '../workspace.ts';
import { VerifyFailure, type ApplicationView, type InstanceView, type Json, type LedgerEntry, type ProcessRef, type PublishableKey } from '../types.ts';
import { compareEnvironment, describeDifference, type EnvironmentComparison, type Leaves } from './definitions.ts';
import { deadlineOf, throwawayApplication, throwawayName, type Listing, type OpenWorkspace, type Platform } from './platform.ts';
import { STANDARD, STANDARD_ENVIRONMENT_KEY, STANDARD_FILE, SettingsRefused, configFor, configLeaves, expectedEnvironment, sameLeaf, settingsOf, standardFile, type Settings, type SettingsGroup } from './settings.ts';

type ApplicationEntry = Extract<LedgerEntry, { kind: 'application' }>;

interface CachedKeys {
  readonly application: string;
  readonly instanceId: string;
  readonly pk: PublishableKey;
  readonly sk: string;
}

interface Held {
  readonly entry: ApplicationEntry;
  readonly keys: CachedKeys;
}

interface ApplicationState {
  readonly settings?: Settings;
  readonly drift: readonly string[] | null;
  readonly drivers: readonly ProcessRef[];
}

const DEFAULT_LIFETIME_HOURS = 6;
const LIFETIME_HOURS = { min: 2, max: 72 } as const;
const REPLACE_WITHIN_MS = 60 * 60_000;
const REAP_GRACE_MS = 5 * 60_000;
const REAP_PER_COMMAND = 5;
const SHOWN_WITHIN_MS = 15_000;
const MOVED_LEAVES_LISTED = 20;

export interface ThrowawayDeps {
  readonly workspace: Workspace;
  readonly platform: Platform;
  readonly clerk: (keys: () => InstanceKeys) => ClerkBackend;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly self: ProcessRef;
  readonly isRunning: (driver: ProcessRef) => boolean;
  readonly fetch?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  readonly now?: () => number;
}

export interface HeldApplication {
  readonly id: string;
  readonly name: string;
  readonly keys: InstanceKeys;
  readonly settings: Settings | null;
}

export interface AppliedApplication {
  readonly id: string;
  readonly name: string;
  readonly keys: InstanceKeys;
  readonly created: boolean;
  readonly changed: { readonly answeredMs: number; readonly visibleMs: number } | null;
  stillApplied(): Promise<boolean>;
  release(): void;
}

export interface Inspection {
  readonly application: HeldApplication;
  readonly found: EnvironmentComparison | 'gone';
}

export interface Throwaway {
  held(): readonly HeldApplication[];
  ensure(options: { readonly willChange: boolean }, progress: (line: string) => void): Promise<{ readonly views: readonly InstanceView[]; readonly created: HeldApplication | null }>;
  apply(group: SettingsGroup, progress: (line: string) => void): Promise<AppliedApplication>;
  inspect(): Promise<readonly Inspection[]>;
  finish(ledger: Workspace, progress: (line: string) => void): Promise<readonly ApplicationView[]>;
}

export const openApplications = (ledger: Workspace): readonly ApplicationEntry[] => ledger.unclosedEntries().filter((entry): entry is ApplicationEntry => entry.kind === 'application');

const keysDir = (ledger: Workspace): string => join(ledger.root, 'instances');
const cachedKeysFile = (ledger: Workspace, name: string): string => join(keysDir(ledger), `${name}.json`);
const stateFile = (ledger: Workspace, name: string): string => join(keysDir(ledger), `${name}.state.json`);

function readKeys(ledger: Workspace, name: string): CachedKeys | null {
  try {
    const raw = JSON.parse(readFileSync(cachedKeysFile(ledger, name), 'utf8')) as Partial<CachedKeys>;
    if (typeof raw.application !== 'string' || typeof raw.instanceId !== 'string' || typeof raw.pk !== 'string' || typeof raw.sk !== 'string') return null;
    return raw as CachedKeys;
  } catch {
    return null;
  }
}

const UNKNOWN: ApplicationState = { drift: null, drivers: [] };

function recordedSettings(raw: unknown): Settings | undefined {
  const record = raw as Partial<Settings> | null | undefined;
  if (typeof record !== 'object' || record === null || typeof record.key !== 'string') return undefined;
  try {
    const fresh = settingsOf(record.declared ?? null, typeof record.askedBy === 'string' ? record.askedBy : null);
    return fresh.key === record.key ? fresh : undefined;
  } catch {
    return undefined;
  }
}

function readState(ledger: Workspace, name: string): ApplicationState {
  try {
    const raw = JSON.parse(readFileSync(stateFile(ledger, name), 'utf8')) as { environmentKey?: unknown; settings?: unknown; drift?: unknown; drivers?: unknown } | null;
    if (typeof raw !== 'object' || raw === null) return UNKNOWN;
    const current = raw.environmentKey === STANDARD_ENVIRONMENT_KEY;
    const settings = current ? recordedSettings(raw.settings) : undefined;
    const drift = current && Array.isArray(raw.drift) && raw.drift.every((leaf) => typeof leaf === 'string') ? (raw.drift as string[]) : null;
    const drivers = Array.isArray(raw.drivers) ? (raw.drivers as Partial<ProcessRef>[]).flatMap((driver) => (typeof driver?.pid === 'number' && typeof driver.startedAt === 'number' ? [{ pid: driver.pid, startedAt: driver.startedAt }] : [])) : [];
    return { ...(settings === undefined ? {} : { settings }), drift, drivers };
  } catch {
    return UNKNOWN;
  }
}

function writeState(ledger: Workspace, name: string, state: ApplicationState): void {
  const file = stateFile(ledger, name);
  const staged = `${file}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(staged, `${JSON.stringify({ environmentKey: STANDARD_ENVIRONMENT_KEY, ...(state.settings === undefined ? {} : { settings: state.settings }), ...(state.drift === null ? {} : { drift: state.drift }), drivers: state.drivers })}\n`, { mode: 0o600 });
  renameSync(staged, file);
}

function lifetimeMs(env: ThrowawayDeps['env']): number {
  const raw = env.VERIFY_THROWAWAY_HOURS;
  if (raw === undefined || raw === '') return DEFAULT_LIFETIME_HOURS * 3_600_000;
  const hours = Number(raw);
  if (!Number.isInteger(hours) || hours < LIFETIME_HOURS.min || hours > LIFETIME_HOURS.max) {
    throw new VerifyFailure('USAGE', `VERIFY_THROWAWAY_HOURS=${raw} is not a whole number from ${LIFETIME_HOURS.min} to ${LIFETIME_HOURS.max}`, 'unset VERIFY_THROWAWAY_HOURS or set it within range');
  }
  return hours * 3_600_000;
}

const excused = (settings: Settings, drift: readonly string[]): readonly string[] => drift.filter((leaf) => !Object.hasOwn(settings.declared?.environment ?? {}, leaf));

function compareWith(settings: Settings, drift: readonly string[], live: Json): EnvironmentComparison {
  const ignored = new Set(excused(settings, drift));
  const expected = Object.entries(expectedEnvironment(settings));
  return compareEnvironment({ environment: Object.fromEntries(expected.filter(([leaf]) => !ignored.has(leaf))), defaults: Object.fromEntries(expected.filter(([leaf]) => ignored.has(leaf))) }, live);
}

interface Moved {
  readonly compared: number;
  readonly answeredMs: number;
  readonly visibleMs: number;
}

const nearDeadline = (name: string, at: number): boolean => {
  const deadline = deadlineOf(name);
  return deadline !== null && deadline.getTime() - at < REPLACE_WITHIN_MS;
};

const seconds = (ms: number, digits: number): string => `${(ms / 1000).toFixed(digits)}s`;

const beyondDeclared = (compared: EnvironmentComparison, declared: Leaves): string | null =>
  compared.differing.some((d) => d.path in declared) ? null : JSON.stringify(compared.differing.map((d) => [d.path, d.found ?? null]));

export function createThrowaway(deps: ThrowawayDeps): Throwaway {
  const { workspace, platform, self } = deps;
  const request = deps.fetch ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? Date.now;
  let listedOnce = false;
  const lasting = new Set<string>();

  const close = (ledger: Workspace, entry: ApplicationEntry): void => {
    rmSync(cachedKeysFile(ledger, entry.name), { force: true });
    rmSync(stateFile(ledger, entry.name), { force: true });
    const dir = keysDir(ledger);
    const staged = existsSync(dir) ? readdirSync(dir).filter((file) => file.startsWith(`${entry.name}.state.json.`) && file.endsWith('.tmp')) : [];
    for (const file of staged) rmSync(join(dir, file), { force: true });
    ledger.append({ id: newEntryId(), kind: 'done', ref: entry.id });
  };

  function pool(): { readonly held: readonly Held[]; readonly strays: readonly ApplicationEntry[] } {
    const held: Held[] = [];
    const strays: ApplicationEntry[] = [];
    for (const entry of openApplications(workspace)) {
      const keys = readKeys(workspace, entry.name);
      if (keys === null) strays.push(entry);
      else held.push({ entry, keys });
    }
    return { held, strays };
  }

  const keysOf = (app: Held): InstanceKeys => ({ pk: app.keys.pk, sk: new Secret('clerk-secret-key', app.keys.sk) });
  const describe = (app: Held, settings: Settings | undefined): HeldApplication => ({ id: app.keys.application, name: app.entry.name, keys: keysOf(app), settings: settings ?? null });
  const otherDrivers = (state: ApplicationState): readonly ProcessRef[] => state.drivers.filter((driver) => driver.pid !== self.pid && deps.isRunning(driver));

  async function environment(pk: PublishableKey): Promise<{ readonly status: number; readonly json: Json; readonly at: number }> {
    const response = await request(`https://${frontendApiHost(pk)}/v1/environment`, { signal: AbortSignal.timeout(15_000) });
    const text = await response.text();
    const date = Date.parse(response.headers.get('date') ?? '');
    let json: Json = null;
    try {
      json = JSON.parse(text) as Json;
    } catch {
      json = null;
    }
    return { status: response.status, json, at: Number.isNaN(date) ? now() : date };
  }

  async function listing(open: OpenWorkspace): Promise<Listing> {
    if (listedOnce) return open.list();
    listedOnce = true;
    return open.opened;
  }

  const unanswered = (app: Held, status: number): VerifyFailure =>
    new VerifyFailure('NOT_READY', `the Frontend API of ${app.keys.application} (${app.entry.name}) answered ${status}`, 'rerun');

  const standardRefused = (said: string): VerifyFailure =>
    new VerifyFailure('INSTANCE_MISCONFIGURED', `Clerk's Platform API refused the standard settings in ${STANDARD_FILE}: ${said}`, 'the standard file needs a change of its own (shared core); the spec is not at fault');

  async function blame(open: OpenWorkspace, app: Held, to: Settings, refusal: SettingsRefused): Promise<VerifyFailure> {
    if (to.declared === null) return standardRefused(refusal.said);
    try {
      await open.configure({ application: throwawayApplication(app.keys.application, app.entry.name), instanceId: app.keys.instanceId }, configFor(STANDARD), { dryRun: true });
    } catch (error) {
      if (error instanceof SettingsRefused) return standardRefused(error.said);
      throw error;
    }
    const { param } = refusal;
    const declared = Object.keys(configLeaves(to.declared.config));
    const what =
      param === null
        ? `Clerk refused these together; remove or correct one of ${declared.join(', ')} in \`instanceSettings\` in ${to.askedBy}.`
        : declared.some((leaf) => leaf === param || leaf.endsWith(`.${param}`))
          ? `correct or remove \`${param}\` in \`instanceSettings\` in ${to.askedBy}: Clerk says what is wrong with it above.`
          : `add \`${param}\` to \`config\` in \`instanceSettings\` in ${to.askedBy} (Clerk requires it with what the spec declares), or remove what requires it.`;
    return new SettingsRefused(
      `${to.askedBy} declares ${to.label}, and Clerk's Platform API refused it: ${refusal.said}`,
      `${what} Settings the Platform API cannot set today: reverification, the development-mode banner, test mode, PII protection off`,
      refusal,
    );
  }

  function notShown(app: Held, to: Settings, status: number, compared: EnvironmentComparison | null, afterMs: number): VerifyFailure {
    const id = app.keys.application;
    if (compared === null) return new VerifyFailure('NOT_READY', `the Frontend API of ${id} (${app.entry.name}) answered ${status} after its settings were changed`, 'rerun');
    if (to.declared === null) {
      return new VerifyFailure(
        'INSTANCE_MISCONFIGURED',
        `${id} (${app.entry.name}) does not match ${STANDARD_FILE} after it was configured: ${compared.differing.slice(0, 5).map((d) => describeDifference(d)).join('; ')}`,
        '`{cli} down`, then rerun once; if it repeats, Clerk changed what a setting does, and the file needs a change of its own, apart from the work being verified',
      );
    }
    const declared = to.declared.environment;
    const unmet = compared.differing.filter((d) => d.path in declared);
    const moved = compared.differing.filter((d) => !(d.path in declared));
    const pairs = moved.slice(0, MOVED_LEAVES_LISTED).map((d) => `'${d.path}': ${d.found === undefined ? 'undefined' : JSON.stringify(d.found)}`).join(', ');
    const parts = [
      ...(unmet.length === 0 ? [] : [`it does not show ${unmet.slice(0, 5).map((d) => describeDifference(d, 'the declaration expects')).join('; ')}`]),
      ...(moved.length === 0 ? [] : [`the change moved ${count(moved.length, 'setting')} the declaration does not list: ${pairs}${moved.length > MOVED_LEAVES_LISTED ? `, and ${moved.length - MOVED_LEAVES_LISTED} more` : ''}`]),
    ];
    return new SettingsRefused(
      `${to.askedBy} declares ${to.label}, and ${seconds(afterMs, 1)} after Clerk accepted it on ${id} ${parts.join('; and ')}`,
      moved.length === 0
        ? `correct the leaves under \`environment\` in ${to.askedBy} to what the setting shows in the instance's public environment`
        : `one setting can move several leaves: add them to \`environment\` in ${to.askedBy}, as listed`,
    );
  }

  async function moveTo(open: OpenWorkspace, app: Held, to: Settings): Promise<Moved> {
    const name = app.entry.name;
    let before = readState(workspace, name);
    if (before.drift === null && to.declared !== null) {
      await moveTo(open, app, STANDARD);
      before = readState(workspace, name);
    }
    writeState(workspace, name, { drift: before.drift, drivers: before.drivers });
    const body = configFor(to);
    const started = now();
    let answer: { readonly after: Json };
    try {
      answer = await open.configure({ application: throwawayApplication(app.keys.application, name), instanceId: app.keys.instanceId }, body);
    } catch (error) {
      if (!(error instanceof SettingsRefused)) throw error;
      writeState(workspace, name, before);
      throw await blame(open, app, to, error);
    }
    const answered = now();
    const after = configLeaves(answer.after ?? {});
    const differing = Object.entries(configLeaves(body)).filter(([leaf, value]) => !sameLeaf(after[leaf], value));
    const declared = to.declared === null ? {} : configLeaves(to.declared.config);
    const altered = differing.find(([leaf]) => Object.hasOwn(declared, leaf) && after[leaf] !== undefined);
    if (altered !== undefined) {
      const [leaf, value] = altered;
      throw new SettingsRefused(`${to.askedBy} declares ${leaf}=${JSON.stringify(value)}, and Clerk stored ${JSON.stringify(after[leaf])}`, `correct \`${leaf}\` in \`instanceSettings\` in ${to.askedBy} to a value Clerk keeps`);
    }
    const lost = differing[0];
    if (lost !== undefined) {
      throw new VerifyFailure(
        'INSTANCE_MISCONFIGURED',
        `Clerk accepted the settings for ${app.keys.application} and its answer does not hold ${lost[0]}=${JSON.stringify(lost[1])} (it has ${after[lost[0]] === undefined ? 'no such key' : JSON.stringify(after[lost[0]])})`,
        'rerun once; if it repeats, the Platform API changed how it answers a config change, which is a verify bug to report',
      );
    }
    const until = answered + SHOWN_WITHIN_MS;
    let settled: string | null = null;
    for (;;) {
      const live = await environment(app.keys.pk);
      const compared = live.status !== 200 ? null : before.drift === null ? compareEnvironment(standardFile(), live.json) : compareWith(to, before.drift, live.json);
      if (compared !== null && compared.differing.length === 0) {
        const drift = before.drift ?? compared.drifted.map((d) => d.path);
        writeState(workspace, name, { settings: to, drift, drivers: before.drivers });
        return { compared: Object.keys(expectedEnvironment(to)).length - excused(to, drift).length, answeredMs: answered - started, visibleMs: now() - answered };
      }
      const rest = compared === null || to.declared === null ? null : beyondDeclared(compared, to.declared.environment);
      if ((rest !== null && rest === settled) || now() >= until) throw notShown(app, to, live.status, compared, now() - answered);
      settled = rest;
      await sleep(500);
    }
  }

  const changedLine = (settings: Settings, id: string, moved: Moved): string =>
    `settings ${settings.label}  on ${id} in ${seconds(moved.answeredMs + moved.visibleMs, 1)} (Clerk answered in ${seconds(moved.answeredMs, 2)}, the instance showed it ${seconds(moved.visibleMs, 2)} later), ${moved.compared} settings match`;

  async function create(open: OpenWorkspace, at: Date | null, progress: (line: string) => void): Promise<{ readonly app: Held; readonly moved: Moved }> {
    const name = throwawayName(new Date((at?.getTime() ?? now()) + lifetimeMs(deps.env)), randomBytes(4).toString('hex'));
    const entry: ApplicationEntry = { id: newEntryId(), kind: 'application', name, workspace: open.workspace };
    workspace.append(entry);
    progress(`instance creating ${name} in ${open.workspace}`);
    const started = now();
    const created = await open.create(name);
    mkdirSync(keysDir(workspace), { recursive: true, mode: 0o700 });
    const keys: CachedKeys = { application: created.application.id, instanceId: created.instanceId, pk: created.pk, sk: created.sk.use('instance-keys-file', (plain) => plain) };
    writeFileSync(cachedKeysFile(workspace, name), `${JSON.stringify(keys)}\n`, { mode: 0o600, flag: 'wx' });
    const app: Held = { entry, keys };
    lasting.add(name);
    const moved = await moveTo(open, app, STANDARD);
    progress(`instance ${keys.application}  up in ${seconds(now() - started, 1)} on standard, ${moved.compared} settings match ${STANDARD_FILE}`);
    return { app, moved };
  }

  async function reap(open: OpenWorkspace, listed: Listing, progress: (line: string) => void): Promise<void> {
    const at = listed.at;
    if (at === null) {
      progress("reap    skipped: Clerk's answer carried no date, and this machine's clock never decides a deadline");
      return;
    }
    const mine = new Set(openApplications(workspace).map((entry) => entry.name));
    const expired = listed.applications.filter((application) => {
      const deadline = deadlineOf(application.name);
      return !mine.has(application.name) && deadline !== null && deadline.getTime() + REAP_GRACE_MS < at.getTime();
    });
    for (const application of expired.slice(0, REAP_PER_COMMAND)) {
      try {
        await open.delete(application);
        progress(`reap    ${application.name}  (its deadline passed and the session that made it never deleted it)`);
      } catch (error) {
        progress(`reap    ${application.name} left in place: ${(error as Error).message}`);
      }
    }
    if (expired.length > REAP_PER_COMMAND) progress(`reap    ${expired.length - REAP_PER_COMMAND} more expired applications are left for the next command`);
    const undated = listed.applications.filter((application) => !mine.has(application.name) && deadlineOf(application.name) === null);
    if (undated.length > 0) progress(`note    ${count(undated.length, 'application')} in the workspace carry no deadline in their name and are never reaped: ${undated.map((application) => application.name).join(', ')}`);
  }

  type Verdict = { readonly keep: 'as-is' | 'busy' } | { readonly repair: string } | { readonly retire: string };

  async function judge(app: Held, state: ApplicationState): Promise<Verdict> {
    if (otherDrivers(state).length > 0) return { keep: 'busy' };
    const live = await environment(app.keys.pk);
    if (live.status === 404) return { retire: 'Clerk no longer serves it' };
    if (live.status !== 200) throw unanswered(app, live.status);
    if (nearDeadline(app.entry.name, live.at)) return { retire: 'its deadline is near' };
    lasting.add(app.entry.name);
    const users = await deps.clerk(() => keysOf(app)).userCount();
    if (users >= REPLACE_AT_USERS) return { retire: `it holds ${users} of the ${DEVELOPMENT_USER_LIMIT} users a development instance allows` };
    if (state.settings === undefined) return { repair: 'what it is on is not recorded' };
    if (compareWith(state.settings, state.drift ?? [], live.json).differing.length > 0) return { repair: `it no longer shows ${state.settings.label}` };
    return { keep: 'as-is' };
  }

  return {
    held: () => pool().held.map((app) => describe(app, readState(workspace, app.entry.name).settings)),

    async inspect() {
      return Promise.all(
        pool().held.map(async (app): Promise<Inspection> => {
          const state = readState(workspace, app.entry.name);
          const live = await environment(app.keys.pk);
          if (live.status !== 200 && live.status !== 404) throw new Error(`the Frontend API of ${app.keys.application} answered ${live.status}`);
          return { application: describe(app, state.settings), found: live.status === 404 ? 'gone' : compareWith(state.settings ?? STANDARD, state.drift ?? [], live.json) };
        }),
      );
    },

    async ensure(options, progress) {
      lifetimeMs(deps.env);
      const { held, strays } = pool();
      const judged = await Promise.all(
        held.map(async (app) => {
          const state = readState(workspace, app.entry.name);
          return { app, state, verdict: await judge(app, state) };
        }),
      );
      const kept = judged.filter((one) => !('retire' in one.verdict));
      for (const { app, state, verdict } of kept) {
        if ('keep' in verdict) progress(`instance ${app.keys.application}  held, on ${state.settings?.label ?? 'unknown settings'}${verdict.keep === 'busy' ? ', and another run in this worktree is driving on it' : ''}`);
      }
      const view = (app: Held, created: boolean): InstanceView => ({ id: app.keys.application, name: app.entry.name, created, settings: readState(workspace, app.entry.name).settings?.label ?? 'unknown settings' });
      if (strays.length === 0 && kept.length > 0 && judged.every((one) => 'keep' in one.verdict) && !options.willChange) return { views: kept.map((one) => view(one.app, false)), created: null };

      const open = await platform.open();
      const listed = await listing(open);
      const byName = new Map(listed.applications.map((application) => [application.name, application]));
      const retired = new Set<string>();
      const retire = async (entry: ApplicationEntry, id: string | null, why: string): Promise<void> => {
        const application = byName.get(entry.name) ?? (id === null ? undefined : throwawayApplication(id, entry.name));
        if (application !== undefined) await open.delete(application);
        close(workspace, entry);
        retired.add(entry.name);
        progress(`instance ${id ?? entry.name} retired (${why})`);
      };
      for (const entry of strays) await retire(entry, null, 'its keys are lost');
      for (const one of judged) if ('retire' in one.verdict) await retire(one.app.entry, one.app.keys.application, one.verdict.retire);

      const failures: unknown[] = [];
      for (const { app, state, verdict } of kept) {
        if (!('repair' in verdict)) continue;
        progress(`settings changing ${app.keys.application} from ${state.settings?.label ?? 'unknown settings'} to standard, because ${verdict.repair}`);
        await moveTo(open, app, STANDARD).then((moved) => progress(changedLine(STANDARD, app.keys.application, moved)), (error: unknown) => failures.push(error));
      }
      let created: Held | null = null;
      if (kept.length === 0) created = await create(open, listed.at, progress).then((made) => made.app, (error: unknown) => (failures.push(error), null));

      await reap(open, { ...listed, applications: listed.applications.filter((application) => !retired.has(application.name)) }, progress);
      progress(`clerk   Platform API: ${count(platform.requests(), 'request')} by this command so far`);
      if (failures.length > 0) throw failures[0];
      return { views: [...kept.map((one) => view(one.app, false)), ...(created === null ? [] : [view(created, true)])], created: created === null ? null : describe(created, STANDARD) };
    },

    async apply(group, progress) {
      const to = group.settings;
      const sent = platform.requests();
      const held = pool().held;
      const lasts = await Promise.all(held.map(async ({ entry, keys }) => lasting.has(entry.name) || !nearDeadline(entry.name, (await environment(keys.pk)).at)));
      const expiring = held.find((_, index) => !lasts[index]);
      const candidates = held.filter((_, index) => lasts[index]).map((app) => ({ app, state: readState(workspace, app.entry.name) }));
      for (const { app } of candidates) lasting.add(app.entry.name);
      let chosen: Held | undefined;
      let changed: Moved | null = null;
      let created = false;

      for (const { app, state } of candidates) {
        if (state.settings?.key !== to.key) continue;
        const live = await environment(app.keys.pk);
        if (live.status !== 200 || compareWith(to, state.drift ?? [], live.json).differing.length > 0) continue;
        progress(`settings ${to.label}  already on ${app.keys.application}`);
        chosen = app;
        break;
      }

      if (chosen === undefined) {
        const open = await platform.open();
        const change = async (app: Held, from: string): Promise<Moved> => {
          progress(`settings changing ${app.keys.application} from ${from} to ${to.declared === null ? `standard, for ${group.specs[0]?.path ?? 'this run'}` : `${to.label}, which ${to.askedBy} declares`}`);
          const moved = await moveTo(open, app, to);
          progress(changedLine(to, app.keys.application, moved));
          return moved;
        };
        const free = candidates.find(({ state }) => otherDrivers(state).length === 0);
        if (free !== undefined) {
          changed = await change(free.app, free.state.settings?.label ?? 'unknown settings');
          chosen = free.app;
        } else {
          const busy = candidates[0];
          if (busy !== undefined) progress(`settings ${to.label}  needs its own application, because ${busy.app.keys.application} is driving ${busy.state.settings?.label ?? 'unknown settings'} for another run in this worktree`);
          else if (expiring !== undefined) progress(`settings ${to.label}  needs its own application, because ${expiring.keys.application} is within an hour of its deadline`);
          const made = await create(open, (await listing(open)).at, progress);
          chosen = made.app;
          created = true;
          changed = to.declared === null ? made.moved : await change(made.app, 'standard');
        }
      }

      const app = chosen;
      const name = app.entry.name;
      const state = readState(workspace, name);
      writeState(workspace, name, { settings: to, drift: state.drift, drivers: [...otherDrivers(state), self] });
      if (platform.requests() > sent) progress(`clerk   Platform API: ${count(platform.requests(), 'request')} by this command so far`);
      return {
        id: app.keys.application,
        name,
        keys: keysOf(app),
        created,
        changed: changed === null ? null : { answeredMs: changed.answeredMs, visibleMs: changed.visibleMs },
        async stillApplied() {
          const live = await environment(app.keys.pk);
          if (live.status !== 200) throw unanswered(app, live.status);
          return compareWith(to, readState(workspace, name).drift ?? [], live.json).differing.length === 0;
        },
        release() {
          const current = readState(workspace, name);
          writeState(workspace, name, { ...current, drivers: otherDrivers(current) });
        },
      };
    },

    async finish(ledger, progress) {
      const owned = openApplications(ledger);
      if (owned.length === 0) return [];
      const open = await platform.open();
      const foreign = owned.filter((entry) => entry.workspace !== open.workspace);
      const mine = owned.filter((entry) => entry.workspace === open.workspace);
      const listed = await listing(open);
      const byName = new Map(listed.applications.map((application) => [application.name, application]));
      const targets = mine.flatMap((entry) => {
        const id = readKeys(ledger, entry.name)?.application;
        return byName.get(entry.name) ?? (id === undefined ? [] : [throwawayApplication(id, entry.name)]);
      });
      const deletions = await Promise.allSettled(targets.map((application) => open.delete(application)));
      const after = await open.list();
      const remaining = new Set(after.applications.map((application) => application.name));
      const gone = mine.filter((entry) => !remaining.has(entry.name));
      for (const entry of gone) close(ledger, entry);
      await reap(open, after, progress);
      progress(`clerk   Platform API: ${count(platform.requests(), 'request')} by this command so far, ${count(gone.length, 'application')} deleted`);

      const left = [...mine.filter((entry) => remaining.has(entry.name)), ...foreign];
      if (left.length > 0) {
        const refusal = deletions.find((result) => result.status === 'rejected');
        const why = foreign.length > 0 ? `${foreign.map((entry) => entry.name).join(', ')} belong to workspace ${foreign[0]!.workspace}, which this credential does not reach` : refusal === undefined ? 'Clerk still lists them' : (refusal.reason as Error).message;
        const one = foreign.length === 1;
        const fixes = [
          ...(left.length > foreign.length ? ['{cli} down again; it deletes what is left'] : []),
          ...(foreign.length === 0 ? [] : [`${foreign.map((entry) => entry.name).join(', ')} ${one ? 'belongs' : 'belong'} to workspace ${foreign[0]!.workspace}, which this credential cannot reach; only a credential of that workspace can delete ${one ? 'it' : 'them'}`]),
        ];
        throw new VerifyFailure('NOT_READY', `${count(left.length, 'application')} of this worktree could not be deleted: ${why}`, fixes.join('. '));
      }
      return gone.map((entry) => ({ name: entry.name }));
    },
  };
}
