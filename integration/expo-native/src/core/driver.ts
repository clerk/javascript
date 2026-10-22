import { createHash } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { redact } from '../../specs/support/secret.ts';
import { isAlive } from './exec.ts';
import { count } from './state.ts';
import type { EvidencePath } from './types.ts';

export type Registration =
  | { readonly kind: 'none' }
  | { readonly kind: 'unreadable' }
  | { readonly kind: 'running'; readonly pid: number }
  | { readonly kind: 'replaceable'; readonly pid: number }
  | { readonly kind: 'stuck'; readonly pid: number };

type Alive = (pid: number) => boolean;

const registrationFile = (stateDir: string): string => join(stateDir, 'daemon.json');

export function readRegistration(stateDir: string, alive: Alive = isAlive): Registration {
  const file = registrationFile(stateDir);
  if (!existsSync(file)) return { kind: 'none' };
  let raw: { readonly pid?: unknown; readonly processStartTime?: unknown } | null;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8')) as typeof raw;
  } catch {
    return { kind: 'unreadable' };
  }
  if (typeof raw !== 'object' || raw === null) return { kind: 'unreadable' };
  const { pid } = raw;
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) return { kind: 'unreadable' };
  if (alive(pid)) return { kind: 'running', pid };
  return typeof raw.processStartTime === 'string' && raw.processStartTime.trim() !== '' ? { kind: 'replaceable', pid } : { kind: 'stuck', pid };
}

export function clearStuckRegistration(stateDir: string, alive: Alive = isAlive): Registration {
  const found = readRegistration(stateDir, alive);
  if (found.kind === 'stuck') rmSync(registrationFile(stateDir), { force: true });
  return found;
}

function describeRegistration(found: Registration): string {
  switch (found.kind) {
    case 'none':
      return 'there was no daemon.json, so no agent-device daemon was registered';
    case 'unreadable':
      return 'daemon.json could not be read as the registration of a daemon';
    case 'running':
      return `daemon.json named pid ${found.pid}, which was running`;
    case 'replaceable':
      return `daemon.json named pid ${found.pid}, which was not running, and it carried a start time, so agent-device replaces it by itself`;
    case 'stuck':
      return `daemon.json named pid ${found.pid}, which was not running, and it carried no start time, which is what a daemon that fails to start leaves; agent-device refuses that registration and never removes it`;
    default: {
      const exhaustive: never = found;
      return exhaustive;
    }
  }
}

export const LEFT_OUT = '<left out>';
export const linesLeftOut = (lines: number): string => `<${count(lines, 'line')} left out>`;

const NUMBER = String.raw`-?\d+(?:\.\d+)?`;
const MOMENT = String.raw`\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+`;
const ELEMENT_TYPE =
  '(?:Alert|Application|Button|Cell|CheckBox|CollectionView|Image|Keyboard|Link|MenuItem|Picker|ScrollView|SearchField|SecureTextField|SegmentedControl|Sheet|Slider|StaticText|Stepper|Switch|TabBar|Table|TextField|TextView|Window)';
const FRAME = String.raw`\{\{${NUMBER}, ${NUMBER}\}, \{${NUMBER}, ${NUMBER}\}\}`;
const ELEMENT = String.raw`(?:(?:"(.*)" )?${ELEMENT_TYPE}(?: \(Element at index \d+\)| \(First Match\)| at ${FRAME})?|Application '(.*)')`;
const QUERY = String.raw`(?:Descendants matching type ${ELEMENT_TYPE}|Element at index \d+|Elements (?:containing elements )?matching predicate (.*))`;
const RUNNER = String.raw`${MOMENT}[+-]\d{4} AgentDeviceRunnerUITests-Runner\[\d+:\d+\] `;
const XCODEBUILD = String.raw`${MOMENT} xcodebuild\[\d+:\d+\] \[MT\] IDETestOperationsObserverDebug: `;
const FAILURE =
  'Could not match active AX application for XCTest application|Error getting element frame kAXErrorInvalidUIElement|timed out while running query-sweep snapshot on the XCTest main thread|timed out while reading snapshot viewport on the XCTest main thread';

const whole = (shape: string): RegExp => new RegExp(`^(?:${shape})$`, 'd');

const ACTIVITIES: readonly RegExp[] = [
  String.raw`Find the ${ELEMENT}(?: \(retry \d+\))?`,
  String.raw`Find: ${QUERY}`,
  String.raw`Checking existence of \`${ELEMENT}\``,
  String.raw`Check for interrupting elements affecting ${ELEMENT}`,
  String.raw`Get all elements bound by index for: ${QUERY}`,
  String.raw`Get number of matches for: ${QUERY}`,
  String.raw`Tap ${ELEMENT}\[${NUMBER}, ${NUMBER}\](?: -> \(${NUMBER}, ${NUMBER}\))?`,
  String.raw`Type (.*)`,
  String.raw`Synthesize event|Set Up|Tear Down|Collecting debug information to assist test failure triage|Interface orientation changed to Portrait`,
  String.raw`Start Test at ${MOMENT}`,
  String.raw`Requesting snapshot of accessibility hierarchy for app with pid \d+`,
  String.raw`Wait for (?:com\.apple\.springboard|(.*)) to idle`,
  String.raw`Ignoring failure to (?:get hierarchy for remote element in process \d+ \(Error getting main window kAXErrorInvalidUIElement\)|(.*))`,
].map(whole);

const LINES: readonly RegExp[] = [
  '',
  String.raw`${RUNNER}\[DEBUG-\d+\] synthesize posted \d+ chars status=-?\d+ tookMs=\d+`,
  String.raw`${RUNNER}\[Default\] Running tests\.\.\.`,
  String.raw`${RUNNER}\[connection\] (?:Connection interrupted: will attempt to reconnect|Connection invalidated!|XPC message send failed|Handshake aborted as the connection has been invalidated|Handshake failed with error: (.*))`,
  String.raw`${XCODEBUILD}(?:${NUMBER} elapsed -- Testing started completed\.|${NUMBER} sec, \+${NUMBER} sec -- (?:start|end))`,
  String.raw`Test Suite '(.*)' (?:started|passed|failed) at ${MOMENT}\.`,
  String.raw`Test Case '(.*)' (?:started|(?:passed|failed) \(${NUMBER} seconds\))\.`,
  String.raw`\t Executed \d+ tests?, with \d+ failures? \(\d+ unexpected\) in ${NUMBER} \(${NUMBER}\) seconds`,
  String.raw`Testing started|Testing failed:|Failing tests:|\tRunnerTests\.testCommand\(\)|\*\* (?:TEST EXECUTE FAILED|TEST EXECUTE SUCCEEDED|BUILD INTERRUPTED) \*\*`,
  String.raw`(.*): error: -\[AgentDeviceRunnerUITests\.RunnerTests testCommand\] : (?:Failed to get matching snapshot: |Failed to resolve query: )?(.*)`,
  String.raw`\tNo matching device \((.*)\) in set at (.*)`,
  String.raw`AGENT_DEVICE_DAEMON_(?:HTTP_)?PORT=\d+`,
  String.raw`Daemon registration (.*); exiting\.`,
  String.raw`Daemon error: (.*)`,
].map(whole);

const ENDS_A_LINE_INSIDE_A_LINE = /[\r\u2028\u2029]/;
const ACTIVITY_LINE = /^([ \t]*t =[ \t]*)(\S+)([ \t]+)(.*)$/;
const READABLE_TIME = /^(?:-?\d+(?:\.\d+)?|nan)s$/;

const RUNNER_TAGS =
  'ABANDONED_WORK_DRAINED|ACTIVATE|ACTIVATE_FACT|ACTIVATE_SKIPPED|ALERT_ACTIVATION|APP_SCREEN_UNRESOLVED|AX_SNAPSHOT_ISSUE_SUPPRESSED|BUSY|COMMAND_ACCEPTED|COMMAND_COALESCED|COMMAND_COMPLETED|COMMAND_FAILED|COORDINATE_TAP_TEXT_INPUT_PROBE_SKIPPED|DESIRED_PORT|DISPATCH_RECOVERY_SKIPPED_XCTEST_OCCUPIED|ELEMENT_TAP_IGNORED_EXCEPTION|FAST_APP_GUARD|HEADLESS_STARTUP|HOST_ACTIVATE|IDLE_KEEPALIVE|IN_APP_BACK_SKIPPED_XCTEST_ENUMERATION|IN_APP_BACK_VISUAL_VERIFICATION|KEYBOARD_AVOIDING_DRAG|KEYBOARD_BAND_FACT|KEYBOARD_RETURN_IGNORED_EXCEPTION|KEYBOARD_RETURN_TARGET_IGNORED_EXCEPTION|KEYBOARD_STABILITY|LISTENER_FAILED|LISTENER_READY|MAIN_THREAD_WORK_ABANDONED|MAIN_THREAD_WORK_DRAINED|PORT|PORT_NOT_SET|POST_SNAPSHOT_DELAY_MARK_FAILED|POST_SNAPSHOT_DELAY_MARK_SKIPPED_XCTEST_OCCUPIED|PRIVATE_AX_CUSTOM_ACTIONS|PRIVATE_AX_CUSTOM_ACTIONS_READ_TIMEOUT|PRIVATE_AX_DEEP_EXTENSION|PRIVATE_AX_DEEP_EXTENSION_MISS|PRIVATE_AX_DEPTH_MEMORY_CLEARED|PRIVATE_AX_DEPTH_REMEMBERED|PRIVATE_AX_SNAPSHOT_BUDGET_EXHAUSTED|PRIVATE_AX_SNAPSHOT_DEPTH_RETRY|PRIVATE_AX_SNAPSHOT_FAILED|PRIVATE_AX_SNAPSHOT_SPARSE|PRIVATE_AX_SNAPSHOT_USED|PRIVATE_AX_VIEWPORT_FALLBACK|READ_TARGET_NOT_RUNNING|RECORD_START|RECORD_STOP_FAILED|REPAIR_TEXT_ENTRY|RETRY|SCREEN_CAPTURE|SCROLL_VIEWPORT|SEND_FAILED|SNAPSHOT_AX_UNAVAILABLE|SNAPSHOT_BACKEND_FAILED|SNAPSHOT_FLAT_FALLBACK_DEADLINE|SNAPSHOT_FLAT_IGNORED_EXCEPTION|SNAPSHOT_PLAN_BUDGET_EXHAUSTED|SNAPSHOT_PROJECTION_MISMATCH|SNAPSHOT_QUERY_IGNORED_EXCEPTION|SNAPSHOT_RECOVERED|SNAPSHOT_STATE_DEFERRED_XCTEST_OCCUPIED|SNAPSHOT_STATE_FAILED|SNAPSHOT_TAB_FALLBACK_IGNORED_EXCEPTION|SNAPSHOT_TIER_DEADLINE_EXHAUSTED|SNAPSHOT_TIER_SKIPPED_XCTEST_OCCUPIED|SNAPSHOT_XCTEST_CHANNEL_DEFERRED|SNAPSHOT_XCTEST_CHANNEL_PENALIZED|SNAPSHOT_XCTEST_CHANNEL_PENALTY_CLEARED|SNAPSHOT_XCTEST_CHANNEL_PROBE_BOUNDED|SYNTHESIZED_DISPATCH|SYNTHESIZED_GESTURE_POLICY|SYNTHESIZED_RECORD|SYSTEM_MODAL_PROBE_ABORTED|SYSTEM_MODAL_PROBE_DEADLINE|SYSTEM_MODAL_PROBE_SKIPPED|TARGET_CACHE_INVALIDATE|TARGET_CACHE_REFRESH|TEXT_ENTRY_CLEAR|TEXT_ENTRY_INPUT_REMOVED_AFTER_DELIVERY|TEXT_ENTRY_PHASE|TEXT_ENTRY_REPAIR_REFUSED|TEXT_ENTRY_ROUTE|TEXT_ENTRY_UNCONFIRMED|TEXT_INPUT_PROBE_UNAVAILABLE|WAITING|WAIT_RESULT|WEDGED';
const RUNNER_EVENT = new RegExp(String.raw`^(${RUNNER}AGENT_DEVICE_RUNNER_(?:${RUNNER_TAGS})(?![A-Z0-9_]))(.*)$`);
const VALUE_ALONE = new RegExp(String.raw`^(?:${NUMBER}|${FAILURE}|XCTWaiterResult\(rawValue: \d+\))$`);
const HIDDEN_FIELDS: ReadonlySet<string> = new Set(['bundle']);
const numbers = (...keys: readonly string[]): Record<string, string> => Object.fromEntries(keys.map((key) => [key, NUMBER]));
const tuples = (...keys: readonly string[]): Record<string, string> => Object.fromEntries(keys.map((key) => [key, String.raw`\(${NUMBER}(?:,${NUMBER})*\)`]));
const FIELDS: ReadonlyMap<string, RegExp> = new Map(
  Object.entries({
    ...numbers('ok', 'chars', 'commandChars', 'elapsedMs', 'durationMs', 'orientation', 'displayID', 'interfaceOrientation', 'state', 'depth', 'nodes', 'extended', 'slice', 'abandonedForSeconds', 'expectedLength', 'observedLength', 'repaired', 'swipeHeight'),
    ...tuples('point', 'reference', 'start', 'end', 'frame'),
    bundle: String.raw`\S+`,
    commandId: String.raw`runner-[0-9A-Fa-f]{8}-(?:[0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}`,
    command: 'snapshot|tap|targetReset|type|shutdown|alert|gestureViewport|gesture|scroll|keyboardDismiss',
    route: 'synthesized-first-responder|xctest-application-fallback',
    kind: 'absent|visible|unmeasurable|tap|drag|coordinateTap|scroll|synthesizedDrag',
    phase: 'focus|initial-resolve|total|verify|type-delayed|type-first|warmup|type-remaining|clear|type-all',
    mode: 'append|replacement',
    name: 'agent-device-tap|agent-device-swipe|agent-device-controlled-scroll',
    axHealth: 'healthy|unknown',
    frameSource: 'window',
    keyboardPolicy: 'never|requiredWhenAvailable',
    fallbackPolicy: 'xctestCoordinateAllowed|privateSynthesisRequired|xctestCoordinateWhenAccessibilityAvailable',
    fallbackAllowed: 'true|false',
    fallbackAttempted: 'true|false',
    backend: 'private-ax|queries|tree',
    tier: 'queries',
    operation: 'query_sweep|keyboard_band|command_execution|snapshot_viewport|accessibility_health',
    action: 'dismiss',
    decision: 'noKeyboard|unobstructed|avoided',
    keyboardMinY: `none|${NUMBER}`,
    reason:
      '-|keyboard-frame-query-timeout|keyboard-frame-unusable|delivery-budget|bundle_changed|already_foreground|external_app_relaunch|xctest_recorded_failure|queries_backend_timeout|tree_backend_timeout|XCTest-backed snapshot tiers were deferred after recent slow accessibility work on this screen|snapshot returned no semantic controls or content|XCTest-backed snapshot tiers are running with a short recovery probe after recent slow accessibility work on this screen|timed out while reading snapshot viewport on the XCTest main thread|the queries backend spent its capture slice with the collection unfinished',
    error: FAILURE,
  }).map(([key, values]) => [key, new RegExp(`(?:${values})(?= |$)`, 'y')]),
);
const FIELD_KEY = / ([A-Za-z]+)=/y;

const DAEMON_EVENT_START = /^\{"ts":"\d{4}-\d\d-\d\dT/;
const DAEMON_EVENT_TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/;
const DAEMON_EVENT_LEVEL = /^(?:debug|info|warn|error)$/;
const DAEMON_EVENT_PHASE = /^(?:ios_runner_session_detached|ios_runner_session_detach_skipped)$/;
const DAEMON_EVENT_DATA: ReadonlyMap<string, RegExp> = new Map(
  Object.entries({ lane: /^simulator$/, reason: /^runner_never_served_a_command$/, runnerPid: /^\d+$/, port: /^\d+$/, outstandingCharges: /^\d+$/, hasAbandonedCharges: /^(?:true|false)$/ }),
);

interface Shown {
  readonly text: string;
  readonly partly: boolean;
}

type Unknown = 'activity' | 'line';

function withFreeTextLeftOut(match: RegExpExecArray): Shown {
  let text = '';
  let from = 0;
  let partly = false;
  if (match.indices === undefined) throw new Error('a shape of the copy does not say where its free text stands');
  for (const span of match.indices.slice(1)) {
    if (span === undefined) continue;
    text += `${match[0].slice(from, span[0])}${LEFT_OUT}`;
    from = span[1];
    partly = true;
  }
  return { text: text + match[0].slice(from), partly };
}

function knownShape(shapes: readonly RegExp[], text: string): Shown | null {
  for (const shape of shapes) {
    const match = shape.exec(text);
    if (match !== null) return withFreeTextLeftOut(match);
  }
  return null;
}

function runnerFieldsShown(fields: string): Shown {
  if (fields === '') return { text: '', partly: false };
  if (fields.startsWith('=')) return VALUE_ALONE.test(fields.slice(1)) ? { text: fields, partly: false } : { text: `=${LEFT_OUT}`, partly: true };
  let text = '';
  let partly = false;
  for (let at = 0; at < fields.length; ) {
    FIELD_KEY.lastIndex = at;
    const key = FIELD_KEY.exec(fields)?.[1];
    const values = key === undefined ? undefined : FIELDS.get(key);
    if (key === undefined || values === undefined) return { text: `${text} ${LEFT_OUT}`, partly: true };
    values.lastIndex = FIELD_KEY.lastIndex;
    const value = values.exec(fields)?.[0];
    if (value === undefined) return { text: `${text} ${key}=${LEFT_OUT}`, partly: true };
    const hidden = HIDDEN_FIELDS.has(key);
    text += ` ${key}=${hidden ? LEFT_OUT : value}`;
    partly ||= hidden;
    at = values.lastIndex;
  }
  return { text, partly };
}

function daemonEventShown(line: string): Shown | null {
  if (!DAEMON_EVENT_START.test(line)) return null;
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof event !== 'object' || event === null || Array.isArray(event)) return null;
  const { ts, level, phase, data } = event as Readonly<Record<string, unknown>>;
  if (typeof ts !== 'string' || !DAEMON_EVENT_TIME.test(ts) || typeof level !== 'string' || !DAEMON_EVENT_LEVEL.test(level) || typeof phase !== 'string' || !DAEMON_EVENT_PHASE.test(phase)) return null;
  const all = Object.entries(typeof data === 'object' && data !== null ? data : {});
  const known = all.filter(([key, value]) => ['number', 'boolean', 'string'].includes(typeof value) && DAEMON_EVENT_DATA.get(key)?.test(String(value)) === true);
  const fieldsLeftOut = Object.keys(event).filter((key) => !['ts', 'level', 'phase', 'data'].includes(key)).length + all.length - known.length;
  return { text: `${ts} ${level} ${phase}${known.map(([key, value]) => ` ${key}=${String(value)}`).join('')} fieldsLeftOut=${fieldsLeftOut}`, partly: fieldsLeftOut > 0 };
}

function lineShown(line: string): Shown | Unknown {
  if (ENDS_A_LINE_INSIDE_A_LINE.test(line)) return 'line';
  const activity = ACTIVITY_LINE.exec(line);
  if (activity !== null) {
    const known = knownShape(ACTIVITIES, activity[4] ?? '');
    if (known === null) return 'activity';
    const time = READABLE_TIME.test(activity[2] ?? '') ? activity[2] : LEFT_OUT;
    return { text: `${activity[1]}${time}${activity[3]}${known.text}`, partly: known.partly || time === LEFT_OUT };
  }
  const event = RUNNER_EVENT.exec(line);
  if (event !== null) {
    const fields = runnerFieldsShown(event[2] ?? '');
    return { text: `${event[1]}${fields.text}`, partly: fields.partly };
  }
  return knownShape(LINES, line) ?? daemonEventShown(line) ?? 'line';
}

export interface Scrubbed {
  readonly text: string;
  readonly lines: number;
  readonly whole: number;
  readonly partly: number;
  readonly unknownActivities: number;
  readonly unknownLines: number;
}

export function scrubDriverLog(log: string): Scrubbed {
  const endsALine = log.endsWith('\n');
  const lines = log === '' ? [] : (endsALine ? log.slice(0, -1) : log).split('\n');
  const tally = { whole: 0, partly: 0, activity: 0, line: 0 };
  const kept: string[] = [];
  let leftOut = 0;
  const sayWhatWasLeftOut = (): void => {
    if (leftOut > 0) kept.push(linesLeftOut(leftOut));
    leftOut = 0;
  };
  for (const line of lines) {
    const shown = lineShown(line);
    if (typeof shown === 'string') {
      tally[shown] += 1;
      leftOut += 1;
      continue;
    }
    sayWhatWasLeftOut();
    tally[shown.partly ? 'partly' : 'whole'] += 1;
    kept.push(shown.text);
  }
  sayWhatWasLeftOut();
  return { text: redact(kept.length === 0 ? '' : `${kept.join('\n')}${endsALine ? '\n' : ''}`), lines: lines.length, whole: tally.whole, partly: tally.partly, unknownActivities: tally.activity, unknownLines: tally.line };
}

export const DRIVER_LOG_LIMIT_BYTES = 4 * 1024 * 1024;
const HEAD_BYTES = 4096;
const NEWLINE = 0x0a;

interface Mark {
  readonly size: number;
  readonly head: string;
  readonly endsALine: boolean;
}

type Since = Mark | 'the file did not exist' | 'the start of the file' | 'the file could not be read';

const isMissing = (error: unknown): boolean => (error as NodeJS.ErrnoException).code === 'ENOENT';
const nameOf = (error: unknown): string => (error instanceof Error ? ((error as NodeJS.ErrnoException).code ?? error.name) : 'an error');

function readRange(file: string, from: number, to: number): Buffer {
  const bytes = Buffer.alloc(Math.max(0, to - from));
  const fd = openSync(file, 'r');
  try {
    let read = 0;
    for (let got = -1; read < bytes.length && got !== 0; read += got) got = readSync(fd, bytes, read, bytes.length - read, from + read);
    return bytes.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

const headOf = (file: string, size: number): string => createHash('sha256').update(readRange(file, 0, Math.min(size, HEAD_BYTES))).digest('hex');

function markOf(file: string): Mark | 'the file did not exist' | 'the file could not be read' {
  try {
    const { size } = statSync(file);
    return { size, head: headOf(file, size), endsALine: size === 0 || readRange(file, size - 1, size)[0] === NEWLINE };
  } catch (error) {
    return isMissing(error) ? 'the file did not exist' : 'the file could not be read';
  }
}

interface Part {
  readonly copy: Scrubbed;
  readonly bytes: number;
  readonly leftOut: number;
  readonly is: 'what the run added' | 'written during the run' | 'as it was when its registration was removed';
}

type Scrub = (log: string) => Scrubbed;

function partOf(file: string, since: Exclude<Since, 'the file could not be read'>, scrub: Scrub): Part | null {
  if (!existsSync(file)) return null;
  const { size } = statSync(file);
  const grewInPlace = typeof since === 'object' && since.size > 0 && size >= since.size && headOf(file, since.size) === since.head;
  const start = grewInPlace ? since.size : 0;
  const from = Math.max(start, size - DRIVER_LOG_LIMIT_BYTES);
  const read = readRange(file, from, size);
  const startsInALine = from > start || (grewInPlace && !since.endsALine);
  const kept = startsInALine ? (read.includes(NEWLINE) ? read.subarray(read.indexOf(NEWLINE) + 1) : read.subarray(read.length)) : read;
  return {
    copy: scrub(kept.toString('utf8')),
    bytes: size - start,
    leftOut: size - start - kept.length,
    is: since === 'the start of the file' ? 'as it was when its registration was removed' : grewInPlace ? 'what the run added' : 'written during the run',
  };
}

const COPIED: Readonly<Record<Part['is'], (source: string) => string>> = {
  'what the run added': (source) => `the part of ${source} that was written during this run`,
  'written during the run': (source) => `the whole of ${source}, which was written or rewritten during this run`,
  'as it was when its registration was removed': (source) => `the whole of ${source} as it was when the CLI removed that registration`,
};

const linesOf = (copy: Scrubbed): string =>
  `Of the ${count(copy.lines, 'line')} read, the copy keeps ${copy.whole} as written and ${copy.partly} with a label, typed text, name or message left out, and it leaves out ${copy.unknownActivities + copy.unknownLines} whose shape it does not know: ${copy.unknownActivities} with an XCTest activity and ${copy.unknownLines} without.`;

function sessionsOf(stateDir: string): readonly string[] | 'the sessions could not be read' {
  try {
    return readdirSync(join(stateDir, 'sessions')).sort();
  } catch (error) {
    return isMissing(error) ? [] : 'the sessions could not be read';
  }
}

const runnerLogOf = (stateDir: string, session: string): string => join(stateDir, 'sessions', session, 'runner.log');
const SESSION_NAME = /^[A-Za-z0-9._-]{1,64}$/;

export interface DriverWatch {
  startClean(progress: (line: string) => void): void;
  daemonThatDidNotStart(): string | null;
  collect(): void;
}

export function watchDriver(stateDir: string, runDir: EvidencePath, alive: Alive = isAlive, scrub: Scrub = scrubDriverLog): DriverWatch {
  const dir = join(runDir, 'driver');
  const atStart = readRegistration(stateDir, alive);
  const daemonMark = markOf(join(stateDir, 'daemon.log'));
  const sessionsAtStart = sessionsOf(stateDir);
  const runnerMarks = typeof sessionsAtStart === 'string' ? null : new Map(sessionsAtStart.map((session) => [session, markOf(runnerLogOf(stateDir, session))] as const));
  const said: string[] = [`At the start of the run ${describeRegistration(atStart)}.`];
  let cleared: Extract<Registration, { kind: 'stuck' }> | null = null;

  const keep = (name: string, source: string, since: Since, missing: string): void => {
    if (since === 'the file could not be read') {
      return void said.push(`${source} could not be read when the run began, so the CLI cannot tell which part of it this run wrote, and there is no ${name}.`);
    }
    let part: Part | null;
    try {
      part = partOf(join(stateDir, source), since, scrub);
    } catch (error) {
      return void said.push(`${source} could not be copied (${nameOf(error)}), so there is no ${name}.`);
    }
    if (part === null) return void said.push(missing);
    if (part.bytes === 0) return void said.push(`${source} ${part.is === 'what the run added' ? 'did not grow during the run' : 'is empty'}, so there is no ${name}.`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), part.copy.text);
    const cut = part.leftOut === 0 ? '' : `, of which the first ${part.leftOut} were left out, because a copy starts at the start of a line and holds ${DRIVER_LOG_LIMIT_BYTES} bytes at most`;
    said.push(`${name} is ${COPIED[part.is](source)}: ${part.bytes} bytes${cut}. ${linesOf(part.copy)}`);
  };

  return {
    startClean(progress) {
      if (cleared !== null) return;
      const found = clearStuckRegistration(stateDir, alive);
      if (found.kind !== 'stuck') return;
      cleared = found;
      keep('daemon-that-did-not-start.log', 'daemon.log', 'the start of the file', 'The daemon that failed to start left no daemon.log.');
      said.push(`Before a group of tests started, the CLI removed the daemon.json that named pid ${found.pid}, which was not running, so that e2e could start a new daemon. The CLI does this once in a run.`);
      progress(`driver  removed the agent-device registration of pid ${found.pid}, which is not running and has no start time; a daemon failed to start, and agent-device would refuse every command until the file was gone`);
    },
    daemonThatDidNotStart() {
      const now = readRegistration(stateDir, alive);
      if (now.kind !== 'stuck') return null;
      const before = cleared === null ? '' : `, as the daemon before it had (pid ${cleared.pid}), whose registration the CLI removed once in this run and does not remove a second time`;
      return `agent-device's daemon did not start: it left a registration for pid ${now.pid}, which is not running${before}`;
    },
    collect() {
      said.push(`At the end of the run ${describeRegistration(readRegistration(stateDir, alive))}.`);
      keep('daemon.log', 'daemon.log', daemonMark, 'There is no daemon.log, so no agent-device daemon on this machine wrote one.');
      const sessionsAtEnd = sessionsOf(stateDir);
      if (runnerMarks === null || typeof sessionsAtEnd === 'string') {
        said.push(`The sessions of agent-device could not be read ${runnerMarks === null ? 'when the run began' : 'when the run ended'}, so the CLI cannot tell which part of a runner.log this run wrote, and no runner.log is copied.`);
      } else {
        const withALog = sessionsAtEnd.filter((session) => existsSync(runnerLogOf(stateDir, session)));
        const sessions = withALog.filter((session) => SESSION_NAME.test(session));
        if (withALog.length === 0) said.push('No session has a runner.log. The XCTest runner writes one, on iOS only.');
        if (sessions.length < withALog.length) {
          said.push(`The runner.log of ${count(withALog.length - sessions.length, 'session')} is not copied, because the name of the session is not one the CLI gives: letters, digits, dots, dashes and underscores, 64 at most.`);
        }
        for (const session of sessions) {
          const source = `sessions/${session}/runner.log`;
          keep(`runner-${redact(session).replace(/[^A-Za-z0-9._-]/g, '-')}.log`, source, runnerMarks.get(session) ?? 'the file did not exist', `${source} is gone.`);
        }
      }
      said.push(
        'These are logs of the agent-device daemon on this machine. A remote session drives its device with a daemon on the runner, and that daemon writes its logs there.',
        `A copy is not the whole log. It holds a line only when the CLI knows the whole shape of the line, and it writes that line again from the fixed words of the shape, its numbers and its times. Where the log shows a label, typed text, a predicate, a name or a message, the copy shows ${LEFT_OUT}. Lines of any other shape are counted above and shown as one line such as ${linesLeftOut(2)}. Each copy then passed through the redaction the CLI applies to app.log.`,
      );
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'summary.txt'), redact(`${said.join('\n')}\n`));
    },
  };
}
