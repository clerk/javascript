import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { flakesFromReport, flakyPayload, main, normalizeError } from './verify-flaky.mjs';

const signedInError = (name, user, launch, session, passes = 2) =>
  `the app did not show "Signed in as ${name}+clerk_test@example.com" with user ID ${user} and a session ID on the home after launch ${launch}; it shows its error screen: Something went wrong No session was found with id ${session}; passes: ${passes}; reads: ${passes * 2}, the slowest ${passes * 70}ms (the heading)`;

const result = (status, attempts, change = {}) => ({
  status,
  platform: 'android',
  file: 'specs/features/native-js-sync/sign-out-from-native.e2e.ts',
  titlePath: ['signing out in the native profile signs out the JS hooks'],
  attempts,
  ...change,
});

const attempt = (status, message) => ({ status, error: message === undefined ? null : { message } });

const report = results => ({ run: { vcs: { commit: 'a'.repeat(40) }, results } });

const flake = (change = {}) => ({
  platform: 'android',
  file: 'specs/features/native-js-sync/sign-out-from-native.e2e.ts',
  title: 'signing out in the native profile signs out the JS hooks',
  error: 'No session was found with id sess_3L6DwJjKc2IDyokGGeluncGnY69',
  ...change,
});

const runUrl = id => `https://github.com/clerk/javascript/actions/runs/${id}`;

describe('flakesFromReport', () => {
  it('keeps only the flaky results, with the error of the first failed attempt', () => {
    const flakes = flakesFromReport(
      report([
        result('passed', [attempt('passed')]),
        result('failed', [attempt('failed', 'failed twice'), attempt('failed', 'failed twice')]),
        result('skipped', []),
        result(
          'flaky',
          [attempt('failed', 'the first failure'), attempt('failed', 'the second failure'), attempt('passed')],
          { platform: 'ios', titlePath: ['profile', 'signs out'] },
        ),
      ]),
    );

    expect(flakes).toEqual([
      {
        platform: 'ios',
        file: 'specs/features/native-js-sync/sign-out-from-native.e2e.ts',
        title: 'profile › signs out',
        error: 'the first failure',
      },
    ]);
  });
});

describe('normalizeError', () => {
  it('gives the same text for the same failure in different runs', () => {
    expect(
      normalizeError(
        signedInError(
          'ben.a30f',
          'user_3L6FBztORCO03ZuOC5J50LJzABj',
          '2bbc58c2e52b4448',
          'sess_3L6FCP4vbLeA13m6zfP70AEVLx7',
        ),
      ),
    ).toBe(
      normalizeError(
        signedInError(
          'eli.b71c',
          'user_3L6FGxY6BKLgtHLELbgYi9pPd79',
          '0ebe1bf6eff0cba0',
          'sess_3L6FHLmSGr9hI2LbSBm2E4BHlHl',
          3,
        ),
      ),
    );
    expect(
      normalizeError(
        signedInError(
          'ben.a30f',
          'user_3L6FBztORCO03ZuOC5J50LJzABj',
          '2bbc58c2e52b4448',
          'sess_3L6FCP4vbLeA13m6zfP70AEVLx7',
        ),
      ),
    ).toBe(
      'the app did not show "Signed in as <email>" with user ID user_<id> and a session ID on the home after launch <id>; it shows its error screen: Something went wrong No session was found with id sess_<id>',
    );
    expect(normalizeError('No session was found with id sess_3L6DwJjKc2IDyokGGeluncGnY69')).toBe(
      normalizeError('No  session was found\nwith id sess_3L6FHLmSGr9hI2LbSBm2E4BHlHl'),
    );
    expect(normalizeError('ins_2a app_2b org_2c')).toBe('ins_<id> app_<id> org_<id>');
  });

  it('cuts a long message', () => {
    expect(normalizeError('x'.repeat(500))).toBe(`${'x'.repeat(300)}…`);
  });
});

const section = text => ({ type: 'section', text: { type: 'mrkdwn', text } });

describe('flakyPayload', () => {
  it('is null when no test was flaky', () => {
    expect(flakyPayload([])).toBeNull();
    expect(flakyPayload([{ runUrl: runUrl(1), commit: null, flakes: [] }])).toBeNull();
  });

  it('gives each flaky test its own block with its platforms and first error, after a header that links the run', () => {
    const profile = flake({
      file: 'specs/features/user-button-and-profile/profile.e2e.ts',
      title: 'the home sign-out button ends the session',
      error: 'a <b> & c',
    });
    const payload = flakyPayload([
      { runUrl: runUrl(1), commit: null, flakes: [profile, flake()] },
      { runUrl: runUrl(1), commit: null, flakes: [flake({ platform: 'ios' })] },
    ]);

    expect(payload).toEqual({
      blocks: [
        section(
          [
            '*:warning: Expo E2E flaky tests*',
            '*Pull request:* Version packages',
            '*Flaky:* 2 tests passed only on a retry',
            `*Run:* <${runUrl(1)}|View logs>`,
          ].join('\n'),
        ),
        section(
          [
            '`native-js-sync/sign-out-from-native.e2e.ts` signing out in the native profile signs out the JS hooks',
            '*Platforms:* android, ios',
            '*First attempt failed:* No session was found with id sess_&lt;id&gt;',
          ].join('\n'),
        ),
        section(
          [
            '`user-button-and-profile/profile.e2e.ts` the home sign-out button ends the session',
            '*Platforms:* android',
            '*First attempt failed:* a &lt;b&gt; &amp; c',
          ].join('\n'),
        ),
      ],
      unfurl_links: false,
      unfurl_media: false,
    });
  });

  it('names one flaky test in the singular and leaves out the run without a link', () => {
    expect(flakyPayload([{ runUrl: null, commit: null, flakes: [flake()] }]).blocks[0]).toEqual(
      section(
        [
          '*:warning: Expo E2E flaky tests*',
          '*Pull request:* Version packages',
          '*Flaky:* 1 test passed only on a retry',
        ].join('\n'),
      ),
    );
  });

  it('keeps every block under the Slack limit of 3000 characters', () => {
    const payload = flakyPayload([{ runUrl: runUrl(1), commit: null, flakes: [flake({ error: 'x'.repeat(5000) })] }]);
    expect(Math.max(...payload.blocks.map(block => block.text.text.length))).toBeLessThan(3000);
  });
});

describe('the command line', () => {
  it('records the flaky tests of every e2e report, then writes the Slack payload', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-flaky-'));
    const runs = path.join(dir, 'runs');
    const write = (file, value) => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(value));
    };
    write(
      path.join(runs, 'r20261023-143803-a30f', 'e2e', 'report.json'),
      report([result('flaky', [attempt('failed', 'first'), attempt('passed')]), result('passed', [])]),
    );
    write(
      path.join(runs, 'r20261023-143803-a30f', 'e2e-2', 'report.json'),
      report([result('flaky', [attempt('failed', 'second'), attempt('passed')], { platform: 'ios' })]),
    );
    write(path.join(runs, 'r20261023-150000-b00c', 'e2e', 'report.json'), report([]));
    const env = {
      GITHUB_SERVER_URL: 'https://github.com',
      GITHUB_REPOSITORY: 'clerk/javascript',
      GITHUB_RUN_ID: '42',
      GITHUB_SHA: 'b'.repeat(40),
    };
    const out = path.join(dir, 'records', '42', 'verify-flaky-android', 'verify-flaky.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const log = [];

    expect(main(['record', runs, out], env, line => log.push(line))).toBe(0);
    expect(JSON.parse(fs.readFileSync(out, 'utf8'))).toEqual({
      runUrl: runUrl(42),
      commit: 'b'.repeat(40),
      flakes: [flake({ error: 'first' }), flake({ platform: 'ios', error: 'second' })],
    });

    const empty = path.join(dir, 'empty.json');
    expect(main(['record', path.join(dir, 'no-runs'), empty], {}, () => {})).toBe(0);
    expect(JSON.parse(fs.readFileSync(empty, 'utf8'))).toEqual({ runUrl: null, commit: null, flakes: [] });

    const printed = [];
    expect(main(['payload', path.join(dir, 'records')], {}, line => printed.push(line))).toBe(0);
    expect(JSON.parse(printed.join('\n')).blocks[1].text.text.split('\n')[1]).toBe('*Platforms:* android, ios');
    expect(main(['payload'], {}, () => {})).toBe(2);
  });
});
