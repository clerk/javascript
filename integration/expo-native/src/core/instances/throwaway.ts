import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEVELOPMENT_USER_LIMIT, REPLACE_AT_USERS, frontendApiHost, type ClerkBackend } from '../clerk.ts';
import { sleep as defaultSleep } from '../exec.ts';
import type { InstanceKeys } from '../keys.ts';
import { count } from '../state.ts';
import { newEntryId, type Workspace } from '../workspace.ts';
import { VerifyFailure, type ApplicationView, type InstanceView, type Json, type LedgerEntry, type ProcessRef, type PublishableKey } from '../types.ts';
import { compareEnvironment, describeDifference, type EnvironmentComparison, type Leaves } from './settings.ts';
import { deadlineOf, throwawayApplication, throwawayName, type Listing, type OpenWorkspace, type Platform } from './platform.ts';
import { STANDARD, STANDARD_ENVIRONMENT_KEY, STANDARD_FILE, SettingsRefused, configFor, configLeaves, expectedEnvironment, sameLeaf, settingsFileOf, settingsOf, type Settings, type SettingsGroup } from './settings.ts';

type ApplicationEntry = Extract<LedgerEntry, { kind: 'application' }>;

interface InstanceRecord {
  readonly application: string;
  readonly instanceId: string;
  readonly publishableKey: PublishableKey;
}

interface Held {
  readonly entry: ApplicationEntry;
  readonly record: InstanceRecord;
}

interface ApplicationState {
  readonly settings?: Settings;
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
  readonly settings: Settings | null;
  keys(): Promise<InstanceKeys>;
}

export interface AppliedApplication {
  readonly id: string;
  readonly name: string;
  readonly keys: InstanceKeys;
  readonly changed: boolean;
  stillApplied(): Promise<boolean>;
}

export interface Inspection {
  readonly application: HeldApplication;
  readonly found: EnvironmentComparison | 'gone';
}

export interface Throwaway {
  held(): HeldApplication | null;
  ensure(options: { readonly willChange: boolean }, progress: (line: string) => void): Promise<{ readonly views: readonly InstanceView[]; readonly created: HeldApplication | null }>;
  apply(group: SettingsGroup, progress: (line: string) => void): Promise<AppliedApplication>;
  stopDriving(): void;
  inspect(): Promise<Inspection | null>;
  finish(ledger: Workspace, progress: (line: string) => void): Promise<readonly ApplicationView[]>;
}

export const openApplications = (ledger: Workspace): readonly ApplicationEntry[] => ledger.unclosedEntries().filter((entry): entry is ApplicationEntry => entry.kind === 'application');

const recordsDir = (ledger: Workspace): string => join(ledger.root, 'instances');
const recordFile = (ledger: Workspace, name: string): string => join(recordsDir(ledger), `${name}.json`);
const stateFile = (ledger: Workspace, name: string): string => join(recordsDir(ledger), `${name}.state.json`);

function writeWhole(file: string, text: string): void {
  const staged = `${file}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(staged, text, { mode: 0o600 });
  renameSync(staged, file);
}

function readRecord(ledger: Workspace, name: string): InstanceRecord | null {
  try {
    const raw = JSON.parse(readFileSync(recordFile(ledger, name), 'utf8')) as Partial<InstanceRecord> | null;
    if (typeof raw?.application !== 'string' || typeof raw.instanceId !== 'string' || typeof raw.publishableKey !== 'string') return null;
    return { application: raw.application, instanceId: raw.instanceId, publishableKey: raw.publishableKey };
  } catch {
    return null;
  }
}

const UNKNOWN: ApplicationState = { drivers: [] };

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
    const raw = JSON.parse(readFileSync(stateFile(ledger, name), 'utf8')) as { environmentKey?: unknown; settings?: unknown; drivers?: unknown } | null;
    if (typeof raw !== 'object' || raw === null) return UNKNOWN;
    const settings = raw.environmentKey === STANDARD_ENVIRONMENT_KEY ? recordedSettings(raw.settings) : undefined;
    const drivers = Array.isArray(raw.drivers) ? (raw.drivers as Partial<ProcessRef>[]).flatMap((driver) => (typeof driver?.pid === 'number' && typeof driver.startedAt === 'number' ? [{ pid: driver.pid, startedAt: driver.startedAt }] : [])) : [];
    return { ...(settings === undefined ? {} : { settings }), drivers };
  } catch {
    return UNKNOWN;
  }
}

function writeState(ledger: Workspace, name: string, state: ApplicationState): void {
  writeWhole(stateFile(ledger, name), `${JSON.stringify({ environmentKey: STANDARD_ENVIRONMENT_KEY, ...(state.settings === undefined ? {} : { settings: state.settings }), drivers: state.drivers })}\n`);
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

const compareWith = (settings: Settings, live: Json): EnvironmentComparison => compareEnvironment(expectedEnvironment(settings), live);

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

const fileOf = (settings: Settings): string => (settings.askedBy === null ? 'the settings file' : settingsFileOf(settings.askedBy));

const beyondDeclared = (compared: EnvironmentComparison, declared: Leaves): string | null =>
  compared.differing.some((d) => d.path in declared) ? null : JSON.stringify(compared.differing.map((d) => [d.path, d.found ?? null]));

export function createThrowaway(deps: ThrowawayDeps): Throwaway {
  const { workspace, platform, self } = deps;
  const request = deps.fetch ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? Date.now;
  let listedOnce = false;
  const secretKeys = new Map<string, Promise<InstanceKeys['sk']>>();

  const close = (ledger: Workspace, entry: ApplicationEntry): void => {
    const dir = recordsDir(ledger);
    const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.startsWith(`${entry.name}.`)) : [];
    for (const file of files) rmSync(join(dir, file), { force: true });
    ledger.append({ id: newEntryId(), kind: 'done', ref: entry.id });
  };

  function pool(): { readonly held: Held | null; readonly strays: readonly ApplicationEntry[] } {
    let held: Held | null = null;
    const strays: ApplicationEntry[] = [];
    for (const entry of openApplications(workspace)) {
      const record = readRecord(workspace, entry.name);
      if (record === null) strays.push(entry);
      else held ??= { entry, record };
    }
    return { held, strays };
  }

  async function keysOf(app: Held): Promise<InstanceKeys> {
    const id = app.record.application;
    let sk = secretKeys.get(id);
    if (sk === undefined) {
      sk = platform.secretKey(throwawayApplication(id, app.entry.name));
      secretKeys.set(id, sk);
    }
    return { pk: app.record.publishableKey, sk: await sk };
  }
  const describe = (app: Held, settings: Settings | undefined): HeldApplication => ({ id: app.record.application, name: app.entry.name, settings: settings ?? null, keys: () => keysOf(app) });
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
    new VerifyFailure('NOT_READY', `the Frontend API of ${app.record.application} (${app.entry.name}) answered ${status}`, 'rerun; a cloud environment needs *.clerk.accounts.dev in its allowed domains');

  const standardRefused = (said: string): VerifyFailure =>
    new VerifyFailure('INSTANCE_MISCONFIGURED', `Clerk's Platform API refused the standard settings in ${STANDARD_FILE}: ${said}`, 'the standard file needs a change of its own; the spec is not at fault');

  async function blame(open: OpenWorkspace, app: Held, to: Settings, refusal: SettingsRefused): Promise<VerifyFailure> {
    if (to.declared === null) return standardRefused(refusal.said);
    try {
      await open.configure({ application: throwawayApplication(app.record.application, app.entry.name), instanceId: app.record.instanceId }, configFor(STANDARD), { dryRun: true });
    } catch (error) {
      if (error instanceof SettingsRefused) return standardRefused(error.said);
      throw error;
    }
    const { param } = refusal;
    const declared = Object.keys(configLeaves(to.declared.config));
    const what =
      param === null
        ? `Clerk refused these together; remove or correct one of ${declared.join(', ')} in \`config\` in ${fileOf(to)}.`
        : declared.some((leaf) => leaf === param || leaf.endsWith(`.${param}`))
          ? `correct or remove \`${param}\` in \`config\` in ${fileOf(to)}: Clerk says what is wrong with it above.`
          : `add \`${param}\` to \`config\` in ${fileOf(to)} (Clerk requires it with what the spec declares), or remove what requires it.`;
    return new SettingsRefused(
      `${to.askedBy} declares ${to.label}, and Clerk's Platform API refused it: ${refusal.said}`,
      what,
      refusal,
    );
  }

  function notShown(app: Held, to: Settings, status: number, compared: EnvironmentComparison | null, afterMs: number): VerifyFailure {
    const id = app.record.application;
    if (compared === null) return new VerifyFailure('NOT_READY', `the Frontend API of ${id} (${app.entry.name}) answered ${status} after its settings were changed`, 'rerun; a cloud environment needs *.clerk.accounts.dev in its allowed domains');
    if (to.declared === null) {
      return new VerifyFailure(
        'INSTANCE_MISCONFIGURED',
        `${id} (${app.entry.name}) does not match ${STANDARD_FILE} after it was configured: ${compared.differing.slice(0, 5).map((d) => describeDifference(d)).join('; ')}`,
        '`{cli} down`, then rerun once; if it repeats, Clerk changed what a setting does, and the file needs a change of its own, apart from the work being verified',
      );
    }
    const declared = to.declared.environment;
    const unmet = compared.differing.filter((d) => d.path in declared);
    const absent = unmet.filter((d) => d.found === undefined).map((d) => d.path);
    const other = unmet.filter((d) => d.found !== undefined);
    const moved = compared.differing.filter((d) => !(d.path in declared));
    const pairs = moved.slice(0, MOVED_LEAVES_LISTED).map((d) => `${JSON.stringify(d.path)}: ${d.found === undefined ? 'absent' : JSON.stringify(d.found)}`).join(', ');
    const problems = [
      ...(absent.length === 0 ? [] : [{ said: `its public environment has no leaf ${absent.join(', ')}`, fix: `check the spelling of ${absent.join(', ')} under \`environment\` in ${fileOf(to)}` }]),
      ...(other.length === 0 ? [] : [{ said: `it does not show ${other.slice(0, 5).map((d) => describeDifference(d, 'the declaration expects')).join('; ')}`, fix: `correct the leaves under \`environment\` in ${fileOf(to)} to what the setting shows in the instance's public environment` }]),
      ...(moved.length === 0 ? [] : [{ said: `the change moved ${count(moved.length, 'setting')} the declaration does not list: ${pairs}${moved.length > MOVED_LEAVES_LISTED ? `, and ${moved.length - MOVED_LEAVES_LISTED} more` : ''}`, fix: `one setting can move several leaves: add them to \`environment\` in ${fileOf(to)}, as listed` }]),
    ];
    return new SettingsRefused(`${to.askedBy} declares ${to.label}, and ${seconds(afterMs, 1)} after Clerk accepted it on ${id} ${problems.map((problem) => problem.said).join('; and ')}`, problems.map((problem) => problem.fix).join('; '));
  }

  async function moveTo(open: OpenWorkspace, app: Held, to: Settings): Promise<Moved> {
    const name = app.entry.name;
    const before = readState(workspace, name);
    writeState(workspace, name, { drivers: before.drivers });
    const body = configFor(to);
    const started = now();
    let answer: { readonly after: Json };
    try {
      answer = await open.configure({ application: throwawayApplication(app.record.application, name), instanceId: app.record.instanceId }, body);
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
      throw new SettingsRefused(`${to.askedBy} declares ${leaf}=${JSON.stringify(value)}, and Clerk stored ${JSON.stringify(after[leaf])}`, `correct \`${leaf}\` in \`config\` in ${fileOf(to)} to a value Clerk keeps`);
    }
    const lost = differing[0];
    if (lost !== undefined) {
      throw new VerifyFailure(
        'INSTANCE_MISCONFIGURED',
        `Clerk accepted the settings for ${app.record.application} and its answer does not hold ${lost[0]}=${JSON.stringify(lost[1])} (it has ${after[lost[0]] === undefined ? 'no such key' : JSON.stringify(after[lost[0]])})`,
        'rerun once; if it repeats, the Platform API changed how it answers a config change, which is a verify bug to report',
      );
    }
    const until = answered + SHOWN_WITHIN_MS;
    let settled: string | null = null;
    for (;;) {
      const live = await environment(app.record.publishableKey);
      const compared = live.status !== 200 ? null : compareWith(to, live.json);
      if (compared !== null && compared.differing.length === 0) {
        writeState(workspace, name, { settings: to, drivers: before.drivers });
        return { compared: compared.compared, answeredMs: answered - started, visibleMs: now() - answered };
      }
      const rest = compared === null || to.declared === null ? null : beyondDeclared(compared, to.declared.environment);
      if ((rest !== null && rest === settled) || now() >= until) throw notShown(app, to, live.status, compared, now() - answered);
      settled = rest;
      await sleep(500);
    }
  }

  const changedLine = (settings: Settings, id: string, moved: Moved): string =>
    `settings ${settings.label}  on ${id} in ${seconds(moved.answeredMs + moved.visibleMs, 1)} (Clerk answered in ${seconds(moved.answeredMs, 2)}, the instance showed it ${seconds(moved.visibleMs, 2)} later), ${moved.compared} settings match`;

  async function create(open: OpenWorkspace, at: Date | null, progress: (line: string) => void): Promise<Held> {
    const name = throwawayName(new Date((at?.getTime() ?? now()) + lifetimeMs(deps.env)), randomBytes(4).toString('hex'));
    const entry: ApplicationEntry = { id: newEntryId(), kind: 'application', name, workspace: open.workspace };
    workspace.append(entry);
    progress(`instance creating ${name} in ${open.workspace}`);
    const started = now();
    const created = await open.create(name);
    const record: InstanceRecord = { application: created.application.id, instanceId: created.instanceId, publishableKey: created.pk };
    mkdirSync(recordsDir(workspace), { recursive: true, mode: 0o700 });
    writeFileSync(recordFile(workspace, name), `${JSON.stringify(record)}\n`, { mode: 0o600, flag: 'wx' });
    secretKeys.set(record.application, Promise.resolve(created.sk));
    const app: Held = { entry, record };
    const moved = await moveTo(open, app, STANDARD);
    progress(`instance ${record.application}  up in ${seconds(now() - started, 1)} on standard, ${moved.compared} settings match ${STANDARD_FILE}`);
    return app;
  }

  async function reap(open: OpenWorkspace, listed: Listing, progress: (line: string) => void): Promise<void> {
    const at = listed.at;
    if (at === null) return;
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
  }

  type Verdict = { readonly keep: 'as-is' | 'busy' } | { readonly repair: string } | { readonly retire: string };

  async function judge(app: Held, state: ApplicationState): Promise<Verdict> {
    if (otherDrivers(state).length > 0) return { keep: 'busy' };
    const live = await environment(app.record.publishableKey);
    if (live.status === 404) return { retire: 'Clerk no longer serves it' };
    if (live.status !== 200) throw unanswered(app, live.status);
    if (nearDeadline(app.entry.name, live.at)) return { retire: 'its deadline is near' };
    const keys = await keysOf(app);
    const users = await deps.clerk(() => keys).userCount();
    if (users >= REPLACE_AT_USERS) return { retire: `it holds ${users} of the ${DEVELOPMENT_USER_LIMIT} users a development instance allows` };
    if (state.settings === undefined) return { repair: 'what it is on is not recorded' };
    if (compareWith(state.settings, live.json).differing.length > 0) return { repair: `it no longer shows ${state.settings.label}` };
    return { keep: 'as-is' };
  }

  return {
    held: () => {
      const app = pool().held;
      return app === null ? null : describe(app, readState(workspace, app.entry.name).settings);
    },

    async inspect() {
      const app = pool().held;
      if (app === null) return null;
      const state = readState(workspace, app.entry.name);
      const live = await environment(app.record.publishableKey);
      if (live.status !== 200 && live.status !== 404) throw new Error(`the Frontend API of ${app.record.application} answered ${live.status}`);
      return { application: describe(app, state.settings), found: live.status === 404 ? 'gone' : compareWith(state.settings ?? STANDARD, live.json) };
    },

    async ensure(options, progress) {
      lifetimeMs(deps.env);
      const { held, strays } = pool();
      const state = held === null ? UNKNOWN : readState(workspace, held.entry.name);
      const verdict = held === null ? null : await judge(held, state);
      const kept = held !== null && verdict !== null && !('retire' in verdict) ? { app: held, verdict } : null;
      if (kept !== null && 'keep' in kept.verdict) {
        progress(`instance ${kept.app.record.application}  held, on ${state.settings?.label ?? 'unknown settings'}${kept.verdict.keep === 'busy' ? ', and another run in this worktree is driving on it' : ''}`);
      }
      const view = (app: Held, created: boolean): InstanceView => ({ id: app.record.application, name: app.entry.name, created, settings: readState(workspace, app.entry.name).settings?.label ?? 'unknown settings' });
      if (strays.length === 0 && kept !== null && 'keep' in kept.verdict && !options.willChange) return { views: [view(kept.app, false)], created: null };

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
      if (held !== null && verdict !== null && 'retire' in verdict) await retire(held.entry, held.record.application, verdict.retire);

      let failure: unknown;
      if (kept !== null && 'repair' in kept.verdict) {
        progress(`settings changing ${kept.app.record.application} from ${state.settings?.label ?? 'unknown settings'} to standard, because ${kept.verdict.repair}`);
        await moveTo(open, kept.app, STANDARD).then((moved) => progress(changedLine(STANDARD, kept.app.record.application, moved)), (error: unknown) => (failure = error));
      }
      let created: Held | null = null;
      if (kept === null) created = await create(open, listed.at, progress).catch((error: unknown) => ((failure = error), null));

      await reap(open, { ...listed, applications: listed.applications.filter((application) => !retired.has(application.name)) }, progress);
      if (failure !== undefined) throw failure;
      return { views: [...(kept === null ? [] : [view(kept.app, false)]), ...(created === null ? [] : [view(created, true)])], created: created === null ? null : describe(created, STANDARD) };
    },

    async apply(group, progress) {
      const to = group.settings;
      const app = pool().held;
      if (app === null) throw new VerifyFailure('NOT_READY', 'this worktree holds no application to put on the settings of a group', '{cli} up');
      const id = app.record.application;
      const name = app.entry.name;
      const state = readState(workspace, name);
      const other = otherDrivers(state)[0];
      if (other !== undefined) {
        throw new VerifyFailure('DEVICE_BUSY', `another run in this worktree (pid ${other.pid}) is driving on ${id}, and a worktree has one application, which serves one run at a time`, 'let that run finish, then rerun');
      }
      const keys = await keysOf(app);
      let changed = false;
      const live = state.settings?.key === to.key ? await environment(app.record.publishableKey) : null;
      if (live !== null && live.status === 200 && compareWith(to, live.json).differing.length === 0) {
        progress(`settings ${to.label}  already on ${id}`);
      } else {
        progress(`settings changing ${id} from ${state.settings?.label ?? 'unknown settings'} to ${to.declared === null ? `standard, for ${group.specs[0]?.path ?? 'this run'}` : `${to.label}, which ${to.askedBy} declares`}`);
        progress(changedLine(to, id, await moveTo(await platform.open(), app, to)));
        changed = true;
      }
      writeState(workspace, name, { settings: to, drivers: [self] });
      return {
        id,
        name,
        keys,
        changed,
        async stillApplied() {
          const shown = await environment(app.record.publishableKey);
          if (shown.status !== 200) throw unanswered(app, shown.status);
          return compareWith(to, shown.json).differing.length === 0;
        },
      };
    },

    stopDriving() {
      const app = pool().held;
      if (app === null) return;
      const current = readState(workspace, app.entry.name);
      if (current.drivers.some((driver) => driver.pid === self.pid)) writeState(workspace, app.entry.name, { ...current, drivers: otherDrivers(current) });
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
        const id = readRecord(ledger, entry.name)?.application;
        return byName.get(entry.name) ?? (id === undefined ? [] : [throwawayApplication(id, entry.name)]);
      });
      const deletions = await Promise.allSettled(targets.map((application) => open.delete(application)));
      const after = await open.list();
      const remaining = new Set(after.applications.map((application) => application.name));
      const gone = mine.filter((entry) => !remaining.has(entry.name));
      for (const entry of gone) close(ledger, entry);
      await reap(open, after, progress);

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
