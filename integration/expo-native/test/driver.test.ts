import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { DRIVER_LOG_LIMIT_BYTES, LEFT_OUT, clearStuckRegistration, linesLeftOut, readRegistration, scrubDriverLog, watchDriver } from '../src/core/driver.ts';
import type { EvidencePath } from '../src/core/types.ts';
import { protect } from '../specs/support/secret.ts';

const GONE = 2147483646;
const stateDir = (registration?: unknown): string => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-driver-'));
  if (registration !== undefined) writeFileSync(join(dir, 'daemon.json'), typeof registration === 'string' ? registration : JSON.stringify(registration));
  return dir;
};
const nothingRuns = (): boolean => false;
const everythingRuns = (): boolean => true;

describe('the agent-device registration a run finds', () => {
  it('is none when the state directory holds no daemon.json', () => {
    assert.deepEqual(clearStuckRegistration(stateDir(), nothingRuns), { kind: 'none' });
  });

  it('is removed when it names a process that has gone and carries no start time, which agent-device refuses and never removes', () => {
    const dir = stateDir({ pid: GONE, version: '0.21.22', port: 50999 });
    assert.deepEqual(clearStuckRegistration(dir, nothingRuns), { kind: 'stuck', pid: GONE });
    assert.equal(existsSync(join(dir, 'daemon.json')), false);
  });

  it('is removed when its start time is blank', () => {
    const dir = stateDir({ pid: GONE, processStartTime: '  ' });
    assert.deepEqual(clearStuckRegistration(dir, nothingRuns), { kind: 'stuck', pid: GONE });
    assert.equal(existsSync(join(dir, 'daemon.json')), false);
  });

  it('is left to agent-device when it carries a start time, because agent-device replaces that one by itself', () => {
    const registration = { pid: GONE, processStartTime: 'Fri Oct  9 11:59:51 2026' };
    const dir = stateDir(registration);
    assert.deepEqual(clearStuckRegistration(dir, nothingRuns), { kind: 'replaceable', pid: GONE });
    assert.deepEqual(JSON.parse(readFileSync(join(dir, 'daemon.json'), 'utf8')), registration);
  });

  it('is left alone while its process runs, with or without a start time', () => {
    for (const registration of [{ pid: 4242 }, { pid: 4242, processStartTime: 'Fri Oct  9 11:59:51 2026' }]) {
      const dir = stateDir(registration);
      assert.deepEqual(clearStuckRegistration(dir, everythingRuns), { kind: 'running', pid: 4242 });
      assert.ok(existsSync(join(dir, 'daemon.json')));
    }
  });

  it('is left alone when it cannot be read or names no process', () => {
    for (const registration of ['{ not json', 'null', '[]', '4242', { port: 50999 }, { pid: '4242' }, { pid: 0 }]) {
      const dir = stateDir(registration);
      assert.deepEqual(clearStuckRegistration(dir, nothingRuns), { kind: 'unreadable' });
      assert.ok(existsSync(join(dir, 'daemon.json')));
    }
  });

  it('asks the process table by default', () => {
    assert.deepEqual(readRegistration(stateDir({ pid: process.pid })), { kind: 'running', pid: process.pid });
    assert.deepEqual(readRegistration(stateDir({ pid: GONE })), { kind: 'stuck', pid: GONE });
  });
});

const activity = (seconds: string, what: string): string => `    t = ${seconds.padStart(8)}s ${what}`;
const RUNNER = '2026-10-09 10:22:30.374123-0400 AgentDeviceRunnerUITests-Runner[5344:74148624] ';
const tagged = (tag: string, fields = ''): string => `${RUNNER}AGENT_DEVICE_RUNNER_${tag}${fields}`;
const COMMAND = 'runner-0F3A9C1E-7B2D-4E5F-8A6B-1C2D3E4F5A6B';
const copyOf = (log: string): string => scrubDriverLog(log).text;

const WRITTEN_AGAIN_AS_IT_WAS = [
  activity('0.01', 'Start Test at 2026-10-09 10:22:30.374'),
  activity('0.01', 'Set Up'),
  '    t =      nans Interface orientation changed to Portrait',
  activity('1.10', 'Find the Keyboard (First Match)'),
  activity('1.20', 'Find the Window (Element at index 0)'),
  activity('1.30', 'Find the Window at {{0.0, 0.0}, {402.0, 874.0}}'),
  activity('1.40', 'Find the TextField (Element at index 3) (retry 1)'),
  activity('1.50', 'Checking existence of `Keyboard (First Match)`'),
  activity('1.60', 'Get all elements bound by index for: Descendants matching type Alert'),
  activity('1.70', 'Find: Descendants matching type TextField'),
  activity('1.80', 'Find: Element at index 2'),
  activity('1.90', '    Synthesize event'),
  activity('2.00', 'Requesting snapshot of accessibility hierarchy for app with pid 5344'),
  activity('2.10', 'Collecting debug information to assist test failure triage'),
  activity('2.20', 'Wait for com.apple.springboard to idle'),
  activity('2.30', 'Ignoring failure to get hierarchy for remote element in process 11410 (Error getting main window kAXErrorInvalidUIElement)'),
  activity('2.40', 'Tear Down'),
  tagged('WAITING'),
  tagged('PORT', '=50999'),
  tagged('COMMAND_ACCEPTED', ` command=snapshot commandId=${COMMAND}`),
  tagged('COMMAND_COMPLETED', ` command=snapshot commandId=${COMMAND} ok=1`),
  tagged('TEXT_ENTRY_PHASE', ` commandId=${COMMAND} phase=type-first durationMs=214 chars=27 mode=append`),
  tagged('KEYBOARD_BAND_FACT', ' kind=absent reason=- elapsedMs=3'),
  tagged('SYNTHESIZED_DISPATCH', ' kind=tap point=(195.0,520.0) reference=(0.0,0.0,402.0,874.0) orientation=1'),
  tagged('SCROLL_VIEWPORT', ' kind=scroll axHealth=healthy keyboardPolicy=requiredWhenAvailable decision=noKeyboard keyboardMinY=none swipeHeight=437.0'),
  tagged('SNAPSHOT_RECOVERED', ' backend=private-ax reason=XCTest-backed snapshot tiers were deferred after recent slow accessibility work on this screen'),
  tagged('PRIVATE_AX_SNAPSHOT_DEPTH_RETRY', ' depth=24 error=Could not match active AX application for XCTest application'),
  tagged('PRIVATE_AX_SNAPSHOT_FAILED', '=Could not match active AX application for XCTest application'),
  tagged('WAIT_RESULT', '=XCTWaiterResult(rawValue: 2)'),
  `${RUNNER}[DEBUG-1874] synthesize posted 27 chars status=0 tookMs=2383`,
  `${RUNNER}[Default] Running tests...`,
  `${RUNNER}[connection] Connection interrupted: will attempt to reconnect`,
  '2026-10-09 10:24:29.458 xcodebuild[31701:74147400] [MT] IDETestOperationsObserverDebug: 120.521 elapsed -- Testing started completed.',
  '2026-10-09 10:24:29.458 xcodebuild[31701:74147400] [MT] IDETestOperationsObserverDebug: 120.521 sec, +120.521 sec -- end',
  'Testing started',
  '\t Executed 1 test, with 0 failures (0 unexpected) in 119.894 (119.897) seconds',
  '** TEST EXECUTE FAILED **',
  'Failing tests:',
  '\tRunnerTests.testCommand()',
  'AGENT_DEVICE_DAEMON_PORT=50999',
  'AGENT_DEVICE_DAEMON_HTTP_PORT=51000',
  '',
];

const WRITTEN_AGAIN_WITHOUT_ITS_FREE_TEXT: ReadonlyArray<readonly [string, string]> = [
  [activity('1.00', 'Find the "clerk.auth.signUp.password" SecureTextField'), activity('1.00', `Find the "${LEFT_OUT}" SecureTextField`)],
  [activity('1.00', 'Find the "{"screen":"home","sessionId":"sess_2abc"}" StaticText'), activity('1.00', `Find the "${LEFT_OUT}" StaticText`)],
  [activity('1.00', 'Find the "Continue" Button (retry 2)'), activity('1.00', `Find the "${LEFT_OUT}" Button (retry 2)`)],
  [activity('1.00', "Find the Application 'com.clerk.E2EHost'"), activity('1.00', `Find the Application '${LEFT_OUT}'`)],
  [activity('1.00', 'Checking existence of `"Continue" Button`'), activity('1.00', `Checking existence of \`"${LEFT_OUT}" Button\``)],
  [activity('1.00', '    Check for interrupting elements affecting "Continue" Button'), activity('1.00', `    Check for interrupting elements affecting "${LEFT_OUT}" Button`)],
  [activity('1.00', 'Tap "Continue" Button[195.0, 520.0] -> (195.0, 520.0)'), activity('1.00', `Tap "${LEFT_OUT}" Button[195.0, 520.0] -> (195.0, 520.0)`)],
  [activity('1.00', "Tap Application 'com.clerk.E2EHost'[0.5, 0.6] -> (201.0, 524.4)"), activity('1.00', `Tap Application '${LEFT_OUT}'[0.5, 0.6] -> (201.0, 524.4)`)],
  [activity('1.00', `Type 'V' into "clerk.auth.signUp.password" SecureTextField`), activity('1.00', `Type ${LEFT_OUT}`)],
  [activity('1.00', `Type 'Verify-r20261009' into Application 'com.clerk.E2EHost'`), activity('1.00', `Type ${LEFT_OUT}`)],
  [activity('1.00', `Get all elements bound by index for: Elements matching predicate 'label CONTAINS[c] "424242"'`), activity('1.00', `Get all elements bound by index for: Elements matching predicate ${LEFT_OUT}`)],
  [activity('1.00', `Get number of matches for: Elements containing elements matching predicate 'value ==[c] "424242"'`), activity('1.00', `Get number of matches for: Elements containing elements matching predicate ${LEFT_OUT}`)],
  [activity('1.00', 'Wait for com.clerk.E2EHost to idle'), activity('1.00', `Wait for ${LEFT_OUT} to idle`)],
  [activity('1.00', 'Ignoring failure to wait for app to idle'), activity('1.00', `Ignoring failure to ${LEFT_OUT}`)],
  ['    t = 1e3s Synthesize event', `    t = ${LEFT_OUT} Synthesize event`],
  [tagged('ACTIVATE', ' bundle=com.clerk.E2EHost state=4 reason=bundle_changed'), tagged('ACTIVATE', ` bundle=${LEFT_OUT} state=4 reason=bundle_changed`)],
  [tagged('ALERT_ACTIVATION', ' action=dismiss label=Not Now frame=(1.0,2.0,3.0,4.0) point=(5.0,6.0)'), tagged('ALERT_ACTIVATION', ` action=dismiss ${LEFT_OUT}`)],
  [tagged('COMMAND_FAILED', ` command=type commandId=${COMMAND} error=Error Domain=AgentDeviceRunner Code=1 "main thread execution timed out"`), tagged('COMMAND_FAILED', ` command=type commandId=${COMMAND} error=${LEFT_OUT}`)],
  [tagged('TEXT_INPUT_PROBE_UNAVAILABLE', ' issue=Failed to get matching snapshot: No matches found for Descendants matching type TextField from input {('), tagged('TEXT_INPUT_PROBE_UNAVAILABLE', ` ${LEFT_OUT}`)],
  [tagged('LISTENER_FAILED', '=POSIXErrorCode(rawValue: 48): Address already in use'), tagged('LISTENER_FAILED', `=${LEFT_OUT}`)],
  [tagged('SNAPSHOT_RECOVERED', ' backend=queries reason=a reason the copy has not read chars=3'), tagged('SNAPSHOT_RECOVERED', ` backend=queries reason=${LEFT_OUT}`)],
  [tagged('WAITING', ' and more'), tagged('WAITING', ` ${LEFT_OUT}`)],
  [tagged('ACTIVATE', ' state=4 aKeyTheCopyHasNotRead=1 reason=bundle_changed'), tagged('ACTIVATE', ` state=4 ${LEFT_OUT}`)],
  [`${RUNNER}[connection] Handshake failed with error: <Error Domain=NSCocoaErrorDomain Code=4097 "connection to service">`, `${RUNNER}[connection] Handshake failed with error: ${LEFT_OUT}`],
  ["Test Suite 'RunnerTests' started at 2026-10-09 10:22:30.442.", `Test Suite '${LEFT_OUT}' started at 2026-10-09 10:22:30.442.`],
  ["Test Case '-[AgentDeviceRunnerUITests.RunnerTests testCommand]' failed (119.894 seconds).", `Test Case '${LEFT_OUT}' failed (119.894 seconds).`],
  [
    '/Users/runner/work/RunnerTests+Snapshot.swift:88: error: -[AgentDeviceRunnerUITests.RunnerTests testCommand] : Failed to get matching snapshot: No matches found for Element at index 2 from input {(',
    `${LEFT_OUT}: error: -[AgentDeviceRunnerUITests.RunnerTests testCommand] : Failed to get matching snapshot: ${LEFT_OUT}`,
  ],
  ['\tNo matching device (40FE33C1-55A4-49F7-866C-4B594826A371) in set at /Users/runner/Library/Developer/CoreSimulator/Devices', `\tNo matching device (${LEFT_OUT}) in set at ${LEFT_OUT}`],
  ['Daemon error: listen EADDRINUSE: address already in use 127.0.0.1:50999', `Daemon error: ${LEFT_OUT}`],
  ['Daemon registration contended; exiting.', `Daemon registration ${LEFT_OUT}; exiting.`],
  [
    '{"ts":"2026-10-09T14:22:30.374Z","level":"info","phase":"ios_runner_session_detached","session":"daemon","command":"daemon","data":{"deviceId":"40FE33C1-55A4-49F7-866C-4B594826A371","lane":"simulator","sessionId":"verify-ios-abc-0","runnerPid":5344,"port":50999,"runnerLogPath":"/Users/runner/runner.log"}}',
    '2026-10-09T14:22:30.374Z info ios_runner_session_detached lane=simulator runnerPid=5344 port=50999 fieldsLeftOut=5',
  ],
];

const OF_NO_SHAPE_IT_KNOWS: ReadonlyArray<readonly [string, 'activity' | 'line']> = [
  [activity('3.20', `Press key 'V'`), 'activity'],
  [activity('3.20', 'Typing into the focused field'), 'activity'],
  [activity('3.20', `Tap "V" Key[20.0, 700.0]`), 'activity'],
  [activity('3.20', `Find the 'V' Key`), 'activity'],
  [activity('3.20', 'Find the "“V”" Key'), 'activity'],
  [activity('3.20', 'Checking existence of `"V" Key`'), 'activity'],
  [activity('3.20', 'Get all elements bound by accessibility element for 5123'), 'activity'],
  [activity('3.20', 'Interface orientation changed to a word the copy has not read'), 'activity'],
  [activity('3.20', 'Find the Keyboard (First Match) and more'), 'activity'],
  [activity('3.20', ''), 'activity'],
  [`\u001b[2mt = 3.00s Find the Keyboard (First Match)`, 'line'],
  [`${activity('1.00', 'Find the Keyboard (First Match)')}${activity('1.10', `Type 'Verify-r20261009' into "password" SecureTextField`)}`, 'activity'],
  [`{"phase":"runner_output","data":{"chunk":"${activity('1.00', 'Find the Keyboard (First Match)')}\\n${activity('1.10', `Type 'V' into Application 'com.clerk.E2EHost'`)}\\n"}}`, 'line'],
  ['{"ts":"2026-10-09T14:22:30.374Z","level":"info","phase":"request_failed","data":{"message":"text entry verification failed"}}', 'line'],
  ['{"ts":"2026-10-09T14:22:30.374Z","level":"info","phase":"ios_runner_session_detached","phase":"a phase the copy has not read","data":{}}', 'line'],
  [tagged('A_TAG_THE_RUNNER_DOES_NOT_HAVE'), 'line'],
  [tagged('PORTAL', '=50999'), 'line'],
  [`2026-10-09 10:22:30.374123-0400 AnotherProcess[5344:74148624] AGENT_DEVICE_RUNNER_WAITING`, 'line'],
  [`${RUNNER}[] nw_listener_socket_inbox_create_socket setsockopt SO_NECP_LISTENUUID failed [2: No such file or directory]`, 'line'],
  ["    TextField, 0x1, {{0.0, 0.0}, {100.0, 44.0}}, identifier: 'code', placeholderValue: 'Code', value: 424242", 'line'],
  ['    Application, pid: 5344', 'line'],
  ['    "com.apple.CoreSimulator.SimDeviceType" = 12;', 'line'],
  ['Command line invocation:', 'line'],
  ['    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild test-without-building -xctestrun "/Users/runner/x.xctestrun"', 'line'],
  ['Testing started\r', 'line'],
  [`${activity('1.00', 'Find the "Continue')}\u2028on the next line" Button`, 'line'],
  [`${tagged('WAITING')}\u2029`, 'line'],
  ['the app said something', 'line'],
];

describe('what a copy of a driver log keeps', () => {
  it('writes a line again as it was when its whole shape is one the copy knows and no part of it is free text', () => {
    for (const line of WRITTEN_AGAIN_AS_IT_WAS) assert.deepEqual(scrubDriverLog(line), { text: line, lines: line === '' ? 0 : 1, whole: line === '' ? 0 : 1, partly: 0, unknownActivities: 0, unknownLines: 0 }, line);
    const log = `${WRITTEN_AGAIN_AS_IT_WAS.join('\n')}\n`;
    assert.deepEqual(scrubDriverLog(log), { text: log, lines: WRITTEN_AGAIN_AS_IT_WAS.length, whole: WRITTEN_AGAIN_AS_IT_WAS.length, partly: 0, unknownActivities: 0, unknownLines: 0 });
  });

  it('keeps the fixed words, numbers and times of a line it knows, and leaves out its label, typed text, predicate, name or message', () => {
    for (const [line, kept] of WRITTEN_AGAIN_WITHOUT_ITS_FREE_TEXT) assert.deepEqual(scrubDriverLog(line), { text: kept, lines: 1, whole: 0, partly: 1, unknownActivities: 0, unknownLines: 0 }, line);
  });

  it('leaves out a line of any other shape, whole, and counts it', () => {
    for (const [line, kind] of OF_NO_SHAPE_IT_KNOWS) {
      assert.deepEqual(scrubDriverLog(line), { text: linesLeftOut(1), lines: 1, whole: 0, partly: 0, unknownActivities: kind === 'activity' ? 1 : 0, unknownLines: kind === 'line' ? 1 : 0 }, line);
    }
  });

  it('says in the place of each run of lines it left out how many they were', () => {
    const known = activity('1.00', 'Synthesize event');
    const unknown = 'the app said something';
    assert.deepEqual(scrubDriverLog([known, unknown, activity('1.10', `Press key 'V'`), unknown, known, '', unknown].join('\n')), {
      text: [known, linesLeftOut(3), known, '', linesLeftOut(1)].join('\n'),
      lines: 7,
      whole: 3,
      partly: 0,
      unknownActivities: 1,
      unknownLines: 3,
    });
    assert.equal(linesLeftOut(1), '<1 line left out>');
    assert.equal(linesLeftOut(3), '<3 lines left out>');
    assert.equal(copyOf(`${unknown}\n${unknown}\n`), `${linesLeftOut(2)}\n`);
    assert.equal(copyOf(''), '');
  });

  it('leaves out typed text whatever way the time of the activity is written, and does not keep a line for its time', () => {
    for (const time of ['12.10s', 'nans', 'infs', '-1.5s', '1e3s', '12,5s', '12.1ms', 'soon', "'Q'"]) {
      for (const spaces of [' ', '', '      ']) {
        const typed = scrubDriverLog(`    t =${spaces}${time} Type 'Q' into "pw" SecureTextField`);
        assert.equal(typed.text.includes("'Q'"), false, `t =${spaces}${time}`);
        assert.equal(typed.text.includes('pw'), false, `t =${spaces}${time}`);
        assert.equal(copyOf(`    t =${spaces}${time} Press key 'Q'`), linesLeftOut(1), `t =${spaces}${time}`);
        assert.equal(copyOf(`    t =${spaces}${time} Synthesize event`), `    t =${spaces}${/^(?:[\d.-]+|nan)s$/.test(time) ? time : LEFT_OUT} Synthesize event`);
      }
    }
  });

  const CANARY = 'ZqxKpmWvJ';
  const holdsTheCanary = (text: string): boolean => text.toLowerCase().includes(CANARY.toLowerCase());

  it('keeps no text of a caller from the lines the security review probed', () => {
    const typed = `Type '${CANARY}' into "pw" SecureTextField`;
    const probes = [
      ...['nans', 'infs', '-1.5s', '1e3s', '12,5s', '12.1ms'].map((time) => `    t = ${time} ${typed}`),
      `    t =12.1s ${typed}`,
      activity('1.00', `Find the Elements matching predicate 'label CONTAINS[c] "${CANARY}" OR value ==[c] "${CANARY}"'`),
      activity('1.00', `Checking existence of \`Elements matching predicate 'value ==[c] "${CANARY}"'\``),
      activity('1.00', `Get number of matches for: Elements containing elements matching predicate 'label CONTAINS[c] "${CANARY}"'`),
      activity('1.00', `Wait for ${CANARY} to idle`),
      activity('1.00', `Ignoring failure to read value ${CANARY}`),
      activity('1.00', `Find the "${CANARY}" StaticText`),
      tagged('ELEMENT_TAP_IGNORED_EXCEPTION', `=no element with value ${CANARY}`),
      tagged('LISTENER_FAILED', `=${CANARY}`),
      tagged('SEND_FAILED', `=${CANARY}`),
      tagged('PRIVATE_AX_SNAPSHOT_FAILED', `=${CANARY}`),
      `${tagged('TEXT_INPUT_PROBE_UNAVAILABLE', ' issue=Failed to get matching snapshot: No matches found for Descendants matching type TextField from input {(')}\n    TextField, 0x1, {{0.0, 0.0}, {100.0, 44.0}}, identifier: 'code', value: ${CANARY}\n)}`,
      `    TextField, 0x1, {{0.0, 0.0}, {100.0, 44.0}}, identifier: 'code', placeholderValue: 'Code', value: ${CANARY}`,
      tagged(CANARY.toUpperCase()),
      tagged('ALERT_ACTIVATION', ` action=dismiss label=${CANARY} frame=(1,2,3,4) point=(5,6)`),
      tagged('ACTIVATE', ` bundle=${CANARY} state=4 reason=${CANARY}`),
      tagged('ACTIVATE', ` ${CANARY}=1`),
      tagged('ACTIVATE', ` state=4 ${CANARY}=1 reason=bundle_changed`),
      tagged('KEYBOARD_BAND_FACT', ` kind=absent reason=- ${CANARY}=${CANARY}`),
      `the app said ${CANARY}`,
      activity('1.00', `Press key '${CANARY}'`),
      activity('1.00', `Type key '${CANARY}'`),
      activity('1.00', `Set value of "pw" SecureTextField to '${CANARY}'`),
      activity('1.00', `Paste '${CANARY}' into "pw" SecureTextField`),
      activity('1.00', `Tap «${CANARY}» Key[20.0, 700.0]`),
      `${activity('1.00', 'Find the Keyboard (First Match)')}${activity('1.10', typed)}`,
      `{"phase":"runner_output","data":{"chunk":"${activity('1.00', 'Find the Keyboard')}\\n${activity('1.10', `Type \\"${CANARY}\\" into Application 'com.clerk.E2EHost'`)}\\n"}}`,
      `\u001b[2mt = 3.00s Find the "${CANARY}" Button`,
      `{"ts":"2026-10-09T14:22:30.374Z","level":"info","phase":"ios_runner_session_detached","session":"${CANARY}","data":{"lane":"${CANARY}","reason":"${CANARY}","port":"${CANARY}","${CANARY}":1}}`,
      `Daemon error: ${CANARY}`,
      `Daemon registration ${CANARY}; exiting.`,
      `Test Case '${CANARY}' started.`,
    ];
    for (const probe of probes) assert.equal(holdsTheCanary(copyOf(probe)), false, probe);
  });

  it('puts no text into a copy that stands in a line where the shape has none, wherever in the line it stands', () => {
    let tried = 0;
    for (const line of [...WRITTEN_AGAIN_AS_IT_WAS, ...WRITTEN_AGAIN_WITHOUT_ITS_FREE_TEXT.map(([written]) => written)]) {
      for (let at = 0; at <= line.length; at += 1) {
        for (const text of [CANARY, ` ${CANARY} `, `"${CANARY}"`, `'${CANARY}'`, `=${CANARY}`, `${CANARY}=`, ` ${CANARY}=1`, ` ${CANARY}=${CANARY} `, `${CANARY}\r`]) {
          tried += 1;
          const withText = `${line.slice(0, at)}${text}${line.slice(at)}`;
          assert.equal(holdsTheCanary(copyOf(withText)), false, withText);
        }
      }
    }
    assert.ok(tried > 40_000, `${tried} lines tried`);
  });

  it('redacts a value the CLI used where a shape lets its characters through, which only digits can be', () => {
    const digits = `90817${randomBytes(4).readUInt32BE(0)}`.padEnd(12, '7');
    protect(digits);
    assert.equal(copyOf(tagged('PORT', `=${digits}`)), tagged('PORT', '=<redacted>'));
    assert.equal(copyOf(activity('1.00', `Find the Window (Element at index ${digits})`)), activity('1.00', 'Find the Window (Element at index <redacted>)'));
  });

  it('reads four megabytes of lines made to match slowly in less than three seconds each', { timeout: 60_000 }, () => {
    const size = 4 * 1024 * 1024;
    const slow = {
      'the ends of many labels in one line': activity('1.00', `Find the "${'" Button '.repeat(size / 9)}`),
      'the starts of many frames in one line': activity('1.00', `Find the "${'" Window at {{1111111111111111, '.repeat(size / 34)}`),
      'the middles of many failures in one line': ': error: -[AgentDeviceRunnerUITests.RunnerTests testCommand] : '.repeat(size / 64),
      'many fields in one line': tagged('ACTIVATE', ' state=4'.repeat(size / 8)),
      'many short activities': `${activity('1.00', 'Find the "a" Button')}\n`.repeat(size / 36),
      'many starts of a daemon event': '{"ts":"2026-10-09T\n'.repeat(size / 19),
      'spaces after a time and a carriage return': `${activity('1.00', ' '.repeat(110_000))}x\r`,
      'the middles of many failures and a carriage return': `${'a: error: -[AgentDeviceRunnerUITests.RunnerTests testCommand] : '.repeat(11_000)}\r`,
      'the middles of many missing devices and a line separator': `\tNo matching device (${') in set at '.repeat(27_000)}\u2028`,
      'many lines of one character': '{\n'.repeat(size / 2),
    };
    for (const [name, log] of Object.entries(slow)) {
      const started = Date.now();
      scrubDriverLog(log);
      assert.ok(Date.now() - started < 3_000, `${name}: ${Date.now() - started} ms`);
    }
  });
});

describe('the driver logs a run keeps', () => {
  const GONE_TOO = 2147483645;
  const world = (registration?: unknown) => {
    const state = stateDir(registration);
    const run = mkdtempSync(join(tmpdir(), 'verify-driver-run-')) as EvidencePath;
    const kept = (): string[] => (existsSync(join(run, 'driver')) ? readdirSync(join(run, 'driver')).sort() : []);
    const read = (name: string): string => readFileSync(join(run, 'driver', name), 'utf8');
    const summary = (): string[] => read('summary.txt').trim().split('\n');
    const runnerLog = (session: string): string => {
      mkdirSync(join(state, 'sessions', session), { recursive: true });
      return join(state, 'sessions', session, 'runner.log');
    };
    return { state, run, kept, read, summary, runnerLog, daemonLog: join(state, 'daemon.log') };
  };
  const quiet = (): void => undefined;
  const PORT = 'AGENT_DEVICE_DAEMON_PORT=50999\n';
  const NEXT_PORT = 'AGENT_DEVICE_DAEMON_PORT=51000\n';
  const WAITING = `${tagged('WAITING')}\n`;
  const READY = `${tagged('LISTENER_READY')}\n`;
  const lines = (read: number, whole: number, partly = 0, activities = 0, others = 0): string =>
    `Of the ${read} line${read === 1 ? '' : 's'} read, the copy keeps ${whole} as written and ${partly} with a label, typed text, name or message left out, and it leaves out ${activities + others} whose shape it does not know: ${activities} with an XCTest activity and ${others} without.`;
  const LAST_WORDS = [
    'These are logs of the agent-device daemon on this machine. A remote session drives its device with a daemon on the runner, and that daemon writes its logs there.',
    'A copy is not the whole log. It holds a line only when the CLI knows the whole shape of the line, and it writes that line again from the fixed words of the shape, its numbers and its times. Where the log shows a label, typed text, a predicate, a name or a message, the copy shows <left out>. Lines of any other shape are counted above and shown as one line such as <2 lines left out>. Each copy then passed through the redaction the CLI applies to app.log.',
  ];

  it('says plainly that there is nothing when no daemon wrote a log', () => {
    const w = world();
    watchDriver(w.state, w.run, nothingRuns).collect();
    assert.deepEqual(w.kept(), ['summary.txt']);
    assert.deepEqual(w.summary(), [
      'At the start of the run there was no daemon.json, so no agent-device daemon was registered.',
      'At the end of the run there was no daemon.json, so no agent-device daemon was registered.',
      'There is no daemon.log, so no agent-device daemon on this machine wrote one.',
      'No session has a runner.log. The XCTest runner writes one, on iOS only.',
      ...LAST_WORDS,
    ]);
  });

  it('keeps only what each log gained during the run', () => {
    const w = world({ pid: 4242, processStartTime: 'Fri Oct  9 11:59:51 2026' });
    writeFileSync(w.daemonLog, PORT);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), WAITING);
    writeFileSync(w.runnerLog('verify-ios-abc-screen'), WAITING);
    const driver = watchDriver(w.state, w.run, everythingRuns);
    appendFileSync(w.daemonLog, NEXT_PORT);
    appendFileSync(w.runnerLog('verify-ios-abc-0'), READY);
    driver.collect();
    assert.deepEqual(w.kept(), ['daemon.log', 'runner-verify-ios-abc-0.log', 'summary.txt']);
    assert.equal(w.read('daemon.log'), NEXT_PORT);
    assert.equal(w.read('runner-verify-ios-abc-0.log'), READY);
    assert.deepEqual(w.summary(), [
      'At the start of the run daemon.json named pid 4242, which was running.',
      'At the end of the run daemon.json named pid 4242, which was running.',
      `daemon.log is the part of daemon.log that was written during this run: ${NEXT_PORT.length} bytes. ${lines(1, 1)}`,
      `runner-verify-ios-abc-0.log is the part of sessions/verify-ios-abc-0/runner.log that was written during this run: ${READY.length} bytes. ${lines(1, 1)}`,
      'sessions/verify-ios-abc-screen/runner.log did not grow during the run, so there is no runner-verify-ios-abc-screen.log.',
      ...LAST_WORDS,
    ]);
  });

  it('says for each copy how many lines it read, kept as written, kept in part and left out, so that a reader knows the copy is not the log', () => {
    const w = world();
    const driver = watchDriver(w.state, w.run, nothingRuns);
    writeFileSync(w.daemonLog, `${PORT}Daemon error: the request for /v1/sessions was refused\nsomething no daemon is known to write\n`);
    writeFileSync(
      w.runnerLog('verify-ios-abc-0'),
      [WAITING.trimEnd(), activity('1.00', 'Find the "Continue" Button'), activity('1.10', `Type 'V' into "password" SecureTextField`), activity('1.20', `Press key 'V'`), '    Application, pid: 5344', 'Command line invocation:', ''].join('\n'),
    );
    driver.collect();
    assert.equal(w.read('daemon.log'), `${PORT}Daemon error: ${LEFT_OUT}\n${linesLeftOut(1)}\n`);
    assert.equal(w.read('runner-verify-ios-abc-0.log'), [WAITING.trimEnd(), activity('1.00', `Find the "${LEFT_OUT}" Button`), activity('1.10', `Type ${LEFT_OUT}`), linesLeftOut(3), ''].join('\n'));
    assert.match(w.summary()[2]!, /^daemon\.log is the whole of daemon\.log, which was written or rewritten during this run: \d+ bytes\. Of the 3 lines read, the copy keeps 1 as written and 1 with a label, typed text, name or message left out, and it leaves out 1 whose shape it does not know: 0 with an XCTest activity and 1 without\.$/);
    assert.ok(w.summary()[3]!.endsWith(` bytes. ${lines(6, 1, 2, 1, 2)}`), w.summary()[3]);
  });

  it('keeps the whole of a log that a daemon started during the run rewrote, and of a log that did not exist before', () => {
    const w = world();
    writeFileSync(w.daemonLog, `${PORT}AGENT_DEVICE_DAEMON_HTTP_PORT=50998\n`);
    const driver = watchDriver(w.state, w.run, nothingRuns);
    const rewritten = `${NEXT_PORT}AGENT_DEVICE_DAEMON_HTTP_PORT=51001\nDaemon registration contended; exiting.\n`;
    writeFileSync(w.daemonLog, rewritten);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), WAITING);
    driver.collect();
    assert.equal(w.read('daemon.log'), `${NEXT_PORT}AGENT_DEVICE_DAEMON_HTTP_PORT=51001\nDaemon registration ${LEFT_OUT}; exiting.\n`);
    assert.equal(w.read('runner-verify-ios-abc-0.log'), WAITING);
    assert.deepEqual(w.summary().slice(2, 4), [
      `daemon.log is the whole of daemon.log, which was written or rewritten during this run: ${rewritten.length} bytes. ${lines(3, 2, 1)}`,
      `runner-verify-ios-abc-0.log is the whole of sessions/verify-ios-abc-0/runner.log, which was written or rewritten during this run: ${WAITING.length} bytes. ${lines(1, 1)}`,
    ]);
  });

  it('keeps the end of a part that is over the limit, from the start of a line, and says how much it left out', () => {
    const w = world();
    const whole = `${tagged('ACTIVATE', ' state=4'.repeat(110)).padEnd(1023, '4')}\n`;
    assert.equal(whole.length, 1024);
    const driver = watchDriver(w.state, w.run, nothingRuns);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), `${WAITING}${whole.repeat(DRIVER_LOG_LIMIT_BYTES / 1024)}`);
    driver.collect();
    const kept = w.read('runner-verify-ios-abc-0.log');
    assert.equal(kept, whole.repeat(DRIVER_LOG_LIMIT_BYTES / 1024 - 1));
    assert.equal(
      w.summary()[3],
      `runner-verify-ios-abc-0.log is the whole of sessions/verify-ios-abc-0/runner.log, which was written or rewritten during this run: ${DRIVER_LOG_LIMIT_BYTES + WAITING.length} bytes, of which the first ${1024 + WAITING.length} were left out, because a copy starts at the start of a line and holds ${DRIVER_LOG_LIMIT_BYTES} bytes at most. ${lines(DRIVER_LOG_LIMIT_BYTES / 1024 - 1, DRIVER_LOG_LIMIT_BYTES / 1024 - 1)}`,
    );
  });

  it('starts a part at the start of a line when the log ended in the middle of one as the run began, so no half of a line is kept', () => {
    const w = world();
    const half = activity('1.00', 'Find the Window (Element at ');
    writeFileSync(w.runnerLog('verify-ios-abc-0'), `${WAITING}${half}`);
    const driver = watchDriver(w.state, w.run, nothingRuns);
    appendFileSync(w.runnerLog('verify-ios-abc-0'), `index 0)\n${READY}`);
    driver.collect();
    assert.equal(w.read('runner-verify-ios-abc-0.log'), READY);
    assert.ok(w.summary()[3]!.includes(`: ${'index 0)\n'.length + READY.length} bytes, of which the first ${'index 0)\n'.length} were left out, because a copy starts at the start of a line`), w.summary()[3]);
  });

  it('keeps nothing of a part that is one unfinished line', () => {
    const w = world();
    writeFileSync(w.runnerLog('verify-ios-abc-0'), 'AGENT_DEVICE_DAEMON_');
    const driver = watchDriver(w.state, w.run, nothingRuns);
    appendFileSync(w.runnerLog('verify-ios-abc-0'), 'PORT=50999');
    driver.collect();
    assert.equal(w.read('runner-verify-ios-abc-0.log'), '');
  });

  it('writes the copies through the scrub', () => {
    const w = world();
    const driver = watchDriver(w.state, w.run, nothingRuns);
    const typed = `${activity('1.00', `Type 'V' into Application 'com.clerk.E2EHost'`)}\n`;
    writeFileSync(w.daemonLog, typed);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), typed);
    driver.collect();
    assert.equal(w.read('daemon.log'), `${activity('1.00', `Type ${LEFT_OUT}`)}\n`);
    assert.equal(w.read('runner-verify-ios-abc-0.log'), `${activity('1.00', `Type ${LEFT_OUT}`)}\n`);
  });

  it('copies nothing of a log when the scrub throws, and says so', () => {
    const w = world({ pid: GONE });
    writeFileSync(w.daemonLog, PORT);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), `${activity('1.00', `Type 'V' into "password" SecureTextField`)}\n`);
    const driver = watchDriver(w.state, w.run, nothingRuns, () => {
      throw new RangeError('Maximum call stack size exceeded');
    });
    driver.startClean(quiet);
    writeFileSync(w.daemonLog, NEXT_PORT);
    driver.collect();
    assert.deepEqual(w.kept(), ['summary.txt']);
    assert.equal(w.summary()[1], 'daemon.log could not be copied (RangeError), so there is no daemon-that-did-not-start.log.');
    assert.equal(w.summary()[4], 'daemon.log could not be copied (RangeError), so there is no daemon.log.');
    assert.equal(w.summary()[5], 'sessions/verify-ios-abc-0/runner.log could not be copied (RangeError), so there is no runner-verify-ios-abc-0.log.');
  });

  it('copies nothing of a log whose size or start it could not read as the run began, because it cannot tell which part the run wrote', () => {
    const w = world();
    mkdirSync(w.daemonLog);
    mkdirSync(w.runnerLog('verify-ios-abc-0'));
    const driver = watchDriver(w.state, w.run, nothingRuns);
    rmSync(w.daemonLog, { recursive: true });
    rmSync(w.runnerLog('verify-ios-abc-0'), { recursive: true });
    writeFileSync(w.daemonLog, `${PORT}${NEXT_PORT}`);
    writeFileSync(w.runnerLog('verify-ios-abc-0'), `${WAITING}${READY}`);
    writeFileSync(w.runnerLog('verify-ios-abc-1'), WAITING);
    driver.collect();
    assert.deepEqual(w.kept(), ['runner-verify-ios-abc-1.log', 'summary.txt']);
    assert.deepEqual(w.summary().slice(2, 5), [
      'daemon.log could not be read when the run began, so the CLI cannot tell which part of it this run wrote, and there is no daemon.log.',
      'sessions/verify-ios-abc-0/runner.log could not be read when the run began, so the CLI cannot tell which part of it this run wrote, and there is no runner-verify-ios-abc-0.log.',
      `runner-verify-ios-abc-1.log is the whole of sessions/verify-ios-abc-1/runner.log, which was written or rewritten during this run: ${WAITING.length} bytes. ${lines(1, 1)}`,
    ]);
  });

  it('copies no runner.log when it could not list the sessions as the run began, or as it ended', () => {
    for (const unreadable of ['as the run began', 'as the run ended'] as const) {
      const w = world();
      const sessions = join(w.state, 'sessions');
      if (unreadable === 'as the run began') writeFileSync(sessions, '');
      const driver = watchDriver(w.state, w.run, nothingRuns);
      rmSync(sessions, { recursive: true, force: true });
      if (unreadable === 'as the run began') writeFileSync(w.runnerLog('verify-ios-abc-0'), WAITING);
      else writeFileSync(sessions, '');
      driver.collect();
      assert.deepEqual(w.kept(), ['summary.txt']);
      assert.equal(
        w.summary()[3],
        `The sessions of agent-device could not be read ${unreadable === 'as the run began' ? 'when the run began' : 'when the run ended'}, so the CLI cannot tell which part of a runner.log this run wrote, and no runner.log is copied.`,
      );
    }
  });

  it('copies no runner.log of a session whose name is not one the CLI gives, and does not write the name', () => {
    const w = world();
    const driver = watchDriver(w.state, w.run, nothingRuns);
    for (const session of ['a b', 'a\nforged line', 'x'.repeat(65), 'x'.repeat(250), 'verify-ios-abc-0']) writeFileSync(w.runnerLog(session), WAITING);
    driver.collect();
    assert.deepEqual(w.kept(), ['runner-verify-ios-abc-0.log', 'summary.txt']);
    assert.deepEqual(w.summary().slice(3, 5), [
      'The runner.log of 4 sessions is not copied, because the name of the session is not one the CLI gives: letters, digits, dots, dashes and underscores, 64 at most.',
      `runner-verify-ios-abc-0.log is the whole of sessions/verify-ios-abc-0/runner.log, which was written or rewritten during this run: ${WAITING.length} bytes. ${lines(1, 1)}`,
    ]);
    assert.equal(w.summary().length, 7);
  });

  it('redacts a value the CLI used in the summary and in the name of a copy, where the name of a session can put it', () => {
    const known = `known-${randomBytes(12).toString('hex')}`;
    protect(known);
    const w = world();
    const driver = watchDriver(w.state, w.run, nothingRuns);
    writeFileSync(w.runnerLog(known), WAITING);
    mkdirSync(join(w.runnerLog(`${known}-too`)));
    driver.collect();
    assert.deepEqual(w.kept(), ['runner--redacted-.log', 'summary.txt']);
    assert.equal(w.read('summary.txt').includes(known), false);
    assert.deepEqual(w.summary().slice(3, 5), [
      `runner--redacted-.log is the whole of sessions/<redacted>/runner.log, which was written or rewritten during this run: ${WAITING.length} bytes. ${lines(1, 1)}`,
      'sessions/<redacted>-too/runner.log could not be copied (EISDIR), so there is no runner--redacted--too.log.',
    ]);
  });

  it('removes the registration of a daemon that failed to start, keeps that daemon\'s log as it found it, and says what it did', () => {
    const w = world({ pid: GONE });
    const lastWords = `${PORT}Daemon error: listen EADDRINUSE: address already in use 127.0.0.1:50999\n`;
    writeFileSync(w.daemonLog, lastWords);
    const said: string[] = [];
    const driver = watchDriver(w.state, w.run, nothingRuns);
    driver.startClean((line) => said.push(line));
    assert.equal(existsSync(join(w.state, 'daemon.json')), false);
    assert.deepEqual(said, [`driver  removed the agent-device registration of pid ${GONE}, which is not running and has no start time; a daemon failed to start, and agent-device would refuse every command until the file was gone`]);
    writeFileSync(w.daemonLog, NEXT_PORT);
    driver.collect();
    assert.deepEqual(w.kept(), ['daemon-that-did-not-start.log', 'daemon.log', 'summary.txt']);
    assert.equal(w.read('daemon-that-did-not-start.log'), `${PORT}Daemon error: ${LEFT_OUT}\n`);
    assert.deepEqual(w.summary().slice(0, 5), [
      `At the start of the run daemon.json named pid ${GONE}, which was not running, and it carried no start time, which is what a daemon that fails to start leaves; agent-device refuses that registration and never removes it.`,
      `daemon-that-did-not-start.log is the whole of daemon.log as it was when the CLI removed that registration: ${lastWords.length} bytes. ${lines(2, 1, 1)}`,
      `Before a group of tests started, the CLI removed the daemon.json that named pid ${GONE}, which was not running, so that e2e could start a new daemon. The CLI does this once in a run.`,
      'At the end of the run there was no daemon.json, so no agent-device daemon was registered.',
      `daemon.log is the whole of daemon.log, which was written or rewritten during this run: ${NEXT_PORT.length} bytes. ${lines(1, 1)}`,
    ]);
  });

  it('says that the daemon that failed to start left no log, when it left none', () => {
    const w = world({ pid: GONE });
    const driver = watchDriver(w.state, w.run, nothingRuns);
    driver.startClean(quiet);
    driver.collect();
    assert.deepEqual(w.kept(), ['summary.txt']);
    assert.equal(w.summary()[1], 'The daemon that failed to start left no daemon.log.');
  });

  it('removes a registration once in a run, and names both daemons when the second fails to start too', () => {
    const w = world({ pid: GONE });
    const said: string[] = [];
    const driver = watchDriver(w.state, w.run, nothingRuns);
    assert.equal(driver.daemonThatDidNotStart(), `agent-device's daemon did not start: it left a registration for pid ${GONE}, which is not running`);
    driver.startClean((line) => said.push(line));
    assert.equal(driver.daemonThatDidNotStart(), null);
    writeFileSync(join(w.state, 'daemon.json'), JSON.stringify({ pid: GONE_TOO }));
    assert.equal(
      driver.daemonThatDidNotStart(),
      `agent-device's daemon did not start: it left a registration for pid ${GONE_TOO}, which is not running, as the daemon before it had (pid ${GONE}), whose registration the CLI removed once in this run and does not remove a second time`,
    );
    driver.startClean((line) => said.push(line));
    assert.equal(said.length, 1);
    assert.deepEqual(JSON.parse(readFileSync(join(w.state, 'daemon.json'), 'utf8')), { pid: GONE_TOO });
    driver.collect();
    assert.equal(w.summary().at(-5), `At the end of the run daemon.json named pid ${GONE_TOO}, which was not running, and it carried no start time, which is what a daemon that fails to start leaves; agent-device refuses that registration and never removes it.`);
  });

  it('gives a later group a clean start when the daemon fails to start during the run, and keeps what that daemon logged', () => {
    const w = world();
    const driver = watchDriver(w.state, w.run, nothingRuns);
    driver.startClean(quiet);
    writeFileSync(join(w.state, 'daemon.json'), JSON.stringify({ pid: GONE }));
    writeFileSync(w.daemonLog, PORT);
    driver.startClean(quiet);
    assert.equal(existsSync(join(w.state, 'daemon.json')), false);
    writeFileSync(w.daemonLog, NEXT_PORT);
    driver.collect();
    assert.equal(w.read('daemon-that-did-not-start.log'), PORT);
    assert.equal(w.read('daemon.log'), NEXT_PORT);
  });

  it('leaves a registration alone that agent-device can use or replace', () => {
    for (const [registration, alive] of [[{ pid: 4242 }, everythingRuns], [{ pid: GONE, processStartTime: 'Fri Oct  9 11:59:51 2026' }, nothingRuns]] as const) {
      const w = world(registration);
      const driver = watchDriver(w.state, w.run, alive);
      driver.startClean(() => assert.fail('nothing to say'));
      assert.ok(existsSync(join(w.state, 'daemon.json')));
      assert.equal(driver.daemonThatDidNotStart(), null);
    }
  });

  it('still writes the summary when a log cannot be read', () => {
    const w = world();
    writeFileSync(join(w.state, 'daemon.json'), JSON.stringify({ pid: GONE }));
    const driver = watchDriver(w.state, w.run, nothingRuns);
    mkdirSync(w.daemonLog);
    mkdirSync(w.runnerLog('verify-ios-abc-0'));
    driver.startClean(quiet);
    driver.collect();
    assert.deepEqual(w.kept(), ['summary.txt']);
    assert.equal(w.summary()[1], 'daemon.log could not be copied (EISDIR), so there is no daemon-that-did-not-start.log.');
    assert.equal(w.summary()[4], 'daemon.log could not be copied (EISDIR), so there is no daemon.log.');
    assert.equal(w.summary()[5], 'sessions/verify-ios-abc-0/runner.log could not be copied (EISDIR), so there is no runner-verify-ios-abc-0.log.');
    assert.deepEqual(w.summary().slice(-2), LAST_WORDS);
  });
});
