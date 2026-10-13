import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { heldInstances } from '../testing/fake-instances.ts';
import { describe, it } from 'node:test';
import { newTestEmail } from '../specs/support/clerk.ts';
import { assertPublishable, loggedUserIds, sealEvidence } from '../src/core/evidence.ts';
import type { Runner } from '../src/core/exec.ts';
import { evidenceBlock, evidenceMarkers, summarize, withEvidenceBlock } from '../src/core/publish.ts';
import { Secret } from '../specs/support/secret.ts';
import { attach } from '../src/core/verbs.ts';
import { newRunId } from '../specs/support/inputs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, EvidencePath, EvidenceRecord, EvidenceSummary, HostAdapter, RunId } from '../src/core/types.ts';

const OWN_USER = 'user_own';

const hostLogLine = (userId: string | null): string =>
  `2026-10-03 00:00:01.000 Df E2EHost[1:1] [com.clerk.verify:state] verify {"launchId":"l1","screen":"home","signedIn":${userId !== null},"ticket":"succeeded"${userId === null ? '' : `,"userId":"${userId}"`},"v":1}\n`;

function partialRecord(dir: EvidencePath, run: RunId): Omit<EvidenceRecord, 'sealed' | 'tainted'> {
  return {
    run,
    startedAt: '2026-10-03T00:00:00.000Z',
    finishedAt: '2026-10-03T00:00:10.000Z',
    repo: 'clerk-ios',
    gitHead: 'abc',
    dirty: false,
    platform: 'ios',
    backend: 'local',
    remote: null,
    device: 'verify-ios-1',
    build: 'ios-000000000000' as BuildKey,
    results: [
      { spec: { kind: 'explored', path: 'specs/explored/a.e2e.ts', feature: null }, title: 'a', platform: 'ios', status: 'passed', seconds: 1, attempts: 1, error: null, skipReason: null, skippedBy: null, tags: [], failurePage: null, failureScreen: null, failureScreenshot: null },
    ],
    videos: [join(dir, 'video.mp4') as EvidencePath],
    screenshots: [{ label: 'profile', path: join(dir, 'screenshots', 'profile.png') as EvidencePath }],
    appLog: join(dir, 'app.log') as EvidencePath,
    e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath,
    identities: [{ email: newTestEmail(run), userId: OWN_USER }],
    settings: [{ label: 'standard', askedBy: null, specs: ['specs/explored/a.e2e.ts'], application: null, changed: false, held: true, e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath }],
  };
}

function runDir(): { dir: EvidencePath; run: RunId } {
  const run = newRunId();
  const dir = join(mkdtempSync(join(tmpdir(), 'verify-evidence-')), run) as EvidencePath;
  mkdirSync(join(dir, 'e2e'), { recursive: true });
  mkdirSync(join(dir, 'screenshots'), { recursive: true });
  writeFileSync(join(dir, 'video.mp4'), 'mp4');
  writeFileSync(join(dir, 'screenshots', 'profile.png'), 'png');
  writeFileSync(join(dir, 'app.log'), `log line\n${hostLogLine(null)}${hostLogLine(OWN_USER)}${hostLogLine(OWN_USER)}`);
  writeFileSync(join(dir, 'e2e', 'report.json'), '{}');
  return { dir, run };
}

describe('sealEvidence', () => {
  it('writes a sealed run.json beside the evidence layout', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    for (const file of ['run.json', 'video.mp4', 'screenshots/profile.png', 'app.log', 'e2e/report.json']) {
      assert.ok(existsSync(join(dir, file)), file);
    }
    const written = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as EvidenceRecord;
    assert.equal(written.sealed, true);
    assert.deepEqual(written.tainted, []);
    assert.deepEqual(record, written);
  });

  it('marks a file holding a used secret as tainted without rewriting it', () => {
    const { dir, run } = runDir();
    const ticket = new Secret('ticket', 'tkt_planted_secret_value');
    const plain = ticket.use('launch-argument', (value) => value);
    writeFileSync(join(dir, 'e2e', 'report.json'), `{"label":"-verifySignInTicket ${plain}"}`);
    const record = sealEvidence(dir, partialRecord(dir, run));
    assert.deepEqual(record.tainted, [join(dir, 'e2e', 'report.json')]);
    assert.ok(readFileSync(join(dir, 'e2e', 'report.json'), 'utf8').includes(plain), 'sealing leaves e2e files as written');
    assert.throws(() => assertPublishable(record, [OWN_USER]), { code: 'EVIDENCE_UNSAFE', message: /secret/ });
  });
});

describe('assertPublishable', () => {
  it('passes a clean run whose app log names only its own users', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    assert.deepEqual(loggedUserIds(dir), [OWN_USER]);
    assert.equal(assertPublishable(record, loggedUserIds(dir)).run, run);
  });

  it('rejects a run whose app log names a user the run did not create', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    writeFileSync(join(dir, 'app.log'), `${hostLogLine(OWN_USER)}${hostLogLine('user_someone_else')}`);
    assert.throws(() => assertPublishable(record, loggedUserIds(dir)), { code: 'EVIDENCE_UNSAFE', message: /user_someone_else/ });
  });

  it('reads a user ID from a host line that has spaces around the colon', () => {
    const { dir } = runDir();
    writeFileSync(join(dir, 'app.log'), 'I ClerkVerify: verify {"signedIn": true, "userId" : "user_spaced", "v": 1}\n');
    assert.deepEqual(loggedUserIds(dir), ['user_spaced']);
  });

  it('reads no user from a run that kept no app log', () => {
    const { dir } = runDir();
    rmSync(join(dir, 'app.log'));
    assert.deepEqual(loggedUserIds(dir), []);
  });

  it('rejects a run with a failing spec', () => {
    const { dir, run } = runDir();
    const base = sealEvidence(dir, partialRecord(dir, run), []);
    const failing = { ...base, results: base.results.map((r) => ({ ...r, status: 'failed' as const })) };
    assert.throws(() => assertPublishable(failing, []), { code: 'EVIDENCE_UNSAFE', message: /failing/ });
  });
});

describe('the evidence block of a pull request description', () => {
  const summary: EvidenceSummary = { run: 'r20261008-052713-253e' as RunId, platform: 'ios', device: 'iPhone Air on xcode-27', commit: '0f50b597b1c2d3e4f5a60718293a4b5c6d7e8f90', passed: 3, flaky: 0, total: 3 };
  const media = ['![video.mp4](./video.mp4)', '![profile](./profile.png)'];
  const block = evidenceBlock(summary, null, media);

  it('leads with the result in bold, names the run, the device, the commit and the count on one line, then holds each part in its own paragraph, between the markers of its platform', () => {
    assert.equal(
      block,
      [
        '<!-- verify-evidence:ios -->',
        '',
        '**Verified on an iOS simulator.** Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed.',
        '',
        '![video.mp4](./video.mp4)',
        '',
        '![profile](./profile.png)',
        '',
        '<!-- /verify-evidence:ios -->',
      ].join('\n'),
    );
    assert.match(evidenceBlock({ ...summary, passed: 1, flaky: 1, total: 2 }, null, []), /, 1 of 2 passed, 1 flaky \(passed only on a retry\)\.$/m);
    assert.match(evidenceBlock({ ...summary, platform: 'android' }, null, []), /^\*\*Verified on an Android emulator\.\*\* Run /m);
  });

  it('says which run and commit the before is, and how that run went', () => {
    const before: EvidenceSummary = { ...summary, run: 'r20261008-051500-0a1b' as RunId, commit: '5e126375065188df5bec4e4e75d61db03834f395', passed: 0, total: 1 };
    assert.equal(
      evidenceBlock(summary, before, []).split('\n')[2],
      '**Verified on an iOS simulator.** Run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed. Before is run `r20261008-051500-0a1b` at `5e1263750651`, 0 of 1 passed.',
    );
  });

  it('counts a test that passed only on a retry apart from the passed ones', () => {
    const { dir, run } = runDir();
    const base = partialRecord(dir, run);
    const record = sealEvidence(dir, { ...base, results: [base.results[0]!, { ...base.results[0]!, title: 'b', status: 'flaky', attempts: 2, error: 'tap failed' }] }, []);
    assert.deepEqual(summarize(assertPublishable(record, [OWN_USER])), { run, platform: 'ios', device: 'verify-ios-1', commit: 'abc', passed: 1, flaky: 1, total: 2 });
  });

  it('goes after a description that has no block, and leaves that description as it was', () => {
    for (const body of ['## Summary\r\n\r\nFixes the button.  \r\n', 'no newline at the end', 'ends with one\n']) {
      const edit = withEvidenceBlock(body, 'ios', block);
      assert.ok(edit.ok && edit.was === 'added');
      assert.ok(edit.body.startsWith(body), JSON.stringify(body));
      assert.match(edit.body.slice(body.length), /^(\n{1,2}|(\r\n){1,2})<!-- verify-evidence:ios -->/);
      assert.ok(edit.body.replaceAll('\r\n', '\n').endsWith(block));
    }
    assert.deepEqual(withEvidenceBlock('', 'ios', block), { ok: true, body: block, was: 'added' });
  });

  it('replaces the block that is there and keeps every byte before and after it', () => {
    const before = '## Summary\r\n\r\nText above.  \n\n';
    const after = '\n\n- [x] a checklist\r\n<!-- /verify-evidence:android -->\ttrailing\n';
    const old = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, null, ['![old](https://github.com/user-attachments/assets/1)']);
    const edit = withEvidenceBlock(`${before}${old}${after}`, 'ios', block);
    assert.deepEqual(edit, { ok: true, body: `${before}${block.replaceAll('\n', '\r\n')}${after}`, was: 'replaced' });
    assert.equal(edit.ok && edit.body.includes('r20261007-010101-aaaa'), false);
  });

  it('keeps the block of the other platform', () => {
    const android = evidenceBlock({ ...summary, platform: 'android', device: 'Pixel 9' }, null, []);
    const edit = withEvidenceBlock(`intro\n\n${android}\n`, 'ios', block);
    assert.deepEqual(edit, { ok: true, body: `intro\n\n${android}\n\n${block}`, was: 'added' });
  });

  it('takes a marker only when it is a whole line, so a description may quote one', () => {
    const { start, end } = evidenceMarkers('ios');
    const quoting = `The block sits between \`${start}\` and \`${end}\`.\n\n    ${start}\n    indented, so not a marker\n    ${end}\n`;
    assert.deepEqual(withEvidenceBlock(quoting, 'ios', block), { ok: true, body: `${quoting}\n${block}`, was: 'added' });
  });

  const bodyAfter = (body: string, lines: string = block): string => {
    const edit = withEvidenceBlock(body, 'ios', lines);
    assert.ok(edit.ok, body);
    return edit.body;
  };

  it('writes the block with the line endings of the description, added or replaced', () => {
    const crlf = block.replaceAll('\n', '\r\n');
    const old = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, null, media);
    const oldCrlf = old.replaceAll('\n', '\r\n');
    assert.deepEqual(withEvidenceBlock(`intro\r\n\r\n${oldCrlf}\r\noutro`, 'ios', block), { ok: true, body: `intro\r\n\r\n${crlf}\r\noutro`, was: 'replaced' });
    assert.equal(bodyAfter('intro\r\n'), `intro\r\n\r\n${crlf}`);
    assert.equal(bodyAfter('one\r\ntwo'), `one\r\ntwo\r\n\r\n${crlf}`);
    assert.equal(bodyAfter(`intro\n\n${old}\n`), `intro\n\n${block}\n`);
    for (const body of [`intro\r\n\r\n${oldCrlf}\r\noutro`, 'intro\r\n']) assert.equal(/[^\r]\n/.test(bodyAfter(body)), false, 'no bare line feed');
  });

  it('replaces the block that the verify-attach workflow writes for a handed-off run', () => {
    const published = [
      '<!-- verify-evidence:ios -->',
      '',
      'verify run `r20261007-010101-aaaa`, as reported by [the session](https://github.com/clerk/clerk-ios/actions/runs/37731397352) that `octocat` started: 3 of 3 passed on `iPhone Air on xcode-27` at `0f50b597b1c2`.',
      '',
      '![video.mp4](https://github.com/user-attachments/assets/1)',
      '',
      '<!-- /verify-evidence:ios -->',
    ].join('\n');
    assert.deepEqual(withEvidenceBlock(`intro\n\n${published}\n`, 'ios', block), { ok: true, body: `intro\n\n${block}\n`, was: 'replaced' });
  });

  it('refuses to replace text between two markers that is not a block it wrote', () => {
    const { start, end } = evidenceMarkers('ios');
    const notes = `${start}\nIMPORTANT reviewer notes that are not evidence\n${end}\n`;
    assert.deepEqual(withEvidenceBlock(notes, 'ios', block), { ok: false, why: `has text between \`${start}\` and \`${end}\` that is not an evidence block`, fix: 'leave one pair of those markers in the description, or none' });
  });

  it('takes no marker from inside a code fence, so a description may show a whole example block', () => {
    const example = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, null, media);
    const later = evidenceBlock({ ...summary, run: 'r20261009-020202-bbbb' as RunId }, null, media);
    const fences = [['```', '```'], ['```markdown', '```'], ['~~~~', '~~~~~'], ['   ```', '```  '], ['```\n```not the end, it has text after the ticks', '```'], ['```\n~~~', '```'], ['````\n```', '````']] as const;
    for (const [open, close] of fences) {
      const documented = `The block looks like this:\n\n${open}\n${example}\n${close}\n`;
      const added = withEvidenceBlock(documented, 'ios', block);
      assert.deepEqual(added, { ok: true, body: `${documented}\n${block}`, was: 'added' }, open);
      const replaced = withEvidenceBlock(bodyAfter(documented), 'ios', later);
      assert.deepEqual(replaced, { ok: true, body: `${documented}\n${later}`, was: 'replaced' }, open);
    }
  });

  it('still takes a marker after a fence that closed, and one beside a line that only looks like a fence', () => {
    const real = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, null, media);
    for (const before of ['```\ncode\n```\n\n', 'Use ```three ticks``` inline.\n\n', '```three ticks``` that open a line are inline code too.\n\n', '    ```\n\n', '``\n\n']) {
      assert.deepEqual(withEvidenceBlock(`${before}${real}\n`, 'ios', block), { ok: true, body: `${before}${block}\n`, was: 'replaced' }, JSON.stringify(before));
    }
  });

  it('opens no fence at a fence line inside an HTML comment, so the next attach finds the block it wrote', () => {
    const later = evidenceBlock({ ...summary, run: 'r20261009-020202-bbbb' as RunId }, null, media);
    for (const hidden of ['<!--\n```\n-->\n\nintro\n', '<!-- a note\r\n~~~\r\nstill the note -->\r\n', 'intro\n   <!--\n```\n']) {
      const again = withEvidenceBlock(bodyAfter(hidden), 'ios', later);
      assert.equal(again.ok && again.was, 'replaced', JSON.stringify(hidden));
      assert.equal(again.ok && again.body.split('<!-- verify-evidence:ios -->').length, 2, 'one block, not two');
    }
    assert.equal(bodyAfter(`\`\`\`\n<!--\n\`\`\`\n\n${later}\n`), `\`\`\`\n<!--\n\`\`\`\n\n${block}\n`, 'a comment inside a fence is code, and the fence still closes');
  });

  it('refuses a description that ends inside a code fence that never closes, where a block would be code and never found again', () => {
    for (const unclosed of ['intro\n\n```\ncode\n', 'intro\r\n~~~~ js\r\ncode', '```']) {
      assert.deepEqual(withEvidenceBlock(unclosed, 'ios', block), { ok: false, why: 'ends inside a code fence that is never closed', fix: 'close that code fence' }, JSON.stringify(unclosed));
    }
    const earlier = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, null, media);
    assert.equal(bodyAfter(`intro\n\n${earlier}\n\n~~~\ncode\n`), `intro\n\n${block}\n\n~~~\ncode\n`, 'a block before the open fence is still replaced');
  });

  it('refuses a description whose markers are doubled, halved, or out of order, and says which', () => {
    const { start, end } = evidenceMarkers('ios');
    const refused = (body: string): string => {
      const edit = withEvidenceBlock(body, 'ios', block);
      assert.equal(edit.ok, false, body);
      return edit.ok ? '' : edit.why;
    };
    assert.equal(refused(`${block}\n\n${block}`), `has \`${start}\` 2 times and \`${end}\` 2 times`);
    assert.equal(refused(`text\n${start}\nno end`), `has \`${start}\` 1 times and \`${end}\` 0 times`);
    assert.equal(refused(`no start\n${end}\n`), `has \`${start}\` 0 times and \`${end}\` 1 times`);
    assert.equal(refused(`${end}\n${start}`), `has \`${end}\` before \`${start}\``);
  });
});

describe('assertPublishable and the groups of a run', () => {
  it('rejects a run with a group that lost its settings or never invoked e2e, though every result passed', () => {
    const { dir, run } = runDir();
    const base = sealEvidence(dir, partialRecord(dir, run), []);
    const group = base.settings[0]!;
    const other = { ...group, label: 'auth_multi_factor.required_for_sign_up=true' };
    assert.throws(() => assertPublishable({ ...base, settings: [group, { ...other, held: false }] }, []), { code: 'EVIDENCE_UNSAFE', message: /1 group that did not run in full on its settings: auth_multi_factor\.required_for_sign_up=true/ });
    assert.throws(() => assertPublishable({ ...base, settings: [{ ...group, e2eReport: null }, other] }, []), { code: 'EVIDENCE_UNSAFE', message: /did not run in full on its settings: standard/ });
  });
});

describe('attach', () => {
  const host = { repo: 'clerk-ios', githubRepo: 'clerk/clerk-ios' } as HostAdapter;
  const PR_URL = 'https://github.com/clerk/clerk-ios/pull/9';
  const DESCRIPTION = '## Summary\n\nFixes the button.\n';
  const AFTER_COMMIT = '606639a634488fdd6cf3f7ca956213f781e04f24';
  const BEFORE_COMMIT = '5e126375065188df5bec4e4e75d61db03834f395';
  const asset = (n: number): string => `https://github.com/user-attachments/assets/00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

  interface Edit {
    readonly args: readonly string[];
    readonly cwd: string | undefined;
    readonly bodyFile: string;
    readonly attached: readonly string[];
  }

  function fakeGh(options: { readonly attachFlag?: boolean; readonly body?: string; readonly onView?: (views: number, pr: { body: string; state: string }) => void; readonly upload?: (reference: string, address: string) => string } = {}) {
    const pr = { body: options.body ?? DESCRIPTION, state: 'OPEN' };
    const edits: Edit[] = [];
    let views = 0;
    let uploads = 0;
    const runner: Runner = async (command, args, runOptions) => {
      assert.equal(command, 'gh');
      if (args.includes('--help')) return { code: 0, stdout: options.attachFlag === false ? '  -b, --body text   Set the new body.\n' : '      --attach file   Attach a file\n', stderr: '' };
      if (args[1] === 'view') {
        views += 1;
        options.onView?.(views, pr);
        return { code: 0, stdout: JSON.stringify({ body: pr.body, url: PR_URL, state: pr.state }), stderr: '' };
      }
      const bodyFile = readFileSync(args[args.indexOf('--body-file') + 1]!, 'utf8');
      const attached = args.filter((_, i) => args[i - 1] === '--attach').map((file) => readFileSync(join(runOptions!.cwd!, file), 'utf8'));
      edits.push({ args, cwd: runOptions?.cwd, bodyFile, attached });
      pr.body = bodyFile.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, (reference, alt: string, file: string) => {
        const address = asset((uploads += 1));
        return options.upload?.(reference, address) ?? (file.endsWith('.mp4') ? address : `![${alt}](${address})`);
      });
      return { code: 0, stdout: `${PR_URL}\n`, stderr: '' };
    };
    return { runner, pr, edits };
  }

  function checkout(gh: { readonly runner: Runner } = fakeGh()) {
    const packageDir = mkdtempSync(join(tmpdir(), 'verify-attach-'));
    const workspace = openWorkspace({ packageDir, worktree: packageDir, home: join(packageDir, 'home') });
    const deps = { host, workspace, runner: gh.runner, env: {}, progress: () => undefined, instances: heldInstances() };
    const sealed = (shape: { readonly called: string; readonly shots?: readonly string[]; readonly video?: boolean; readonly failed?: boolean; readonly failureShot?: boolean; readonly change?: Partial<EvidenceRecord>; readonly log?: string }) => {
      const { run, dir } = workspace.newRun();
      mkdirSync(join(dir, 'screenshots'), { recursive: true });
      const file = (name: string, holds: string): EvidencePath => (writeFileSync(join(dir, name), holds), join(dir, name) as EvidencePath);
      const base = partialRecord(dir, run);
      const failureScreenshot = shape.failureShot === true ? file('001-failure.png', `${shape.called} failure`) : null;
      file('app.log', shape.log ?? hostLogLine(OWN_USER));
      sealEvidence(
        dir,
        {
          ...base,
          gitHead: shape.failed === true ? BEFORE_COMMIT : AFTER_COMMIT,
          results: [{ ...base.results[0]!, status: shape.failed === true ? 'failed' : 'passed', failureScreenshot }],
          videos: shape.video === false ? [] : [file('video.mp4', `${shape.called} video`)],
          screenshots: (shape.shots ?? ['profile']).map((label) => ({ label, path: file(join('screenshots', `${label}.png`), `${shape.called} ${label}`) })),
          ...shape.change,
        },
        [],
      );
      return { run, dir };
    };
    return { deps, sealed };
  }

  const block = (...lines: readonly string[]): string => [`${DESCRIPTION}`, '<!-- verify-evidence:ios -->', '', ...lines, '', '<!-- /verify-evidence:ios -->'].join('\n');
  const still = { screenshots: ['profile'], video: false };
  const flow = { screenshots: [], video: true };

  it('never calls gh for a run that fails the gate', async () => {
    const calls: string[] = [];
    const { deps, sealed } = checkout({ runner: async (command) => (calls.push(command), { code: 0, stdout: '', stderr: '' }) });
    const { run } = sealed({ called: 'after', log: hostLogLine('user_foreign') });
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), { code: 'EVIDENCE_UNSAFE' });
    assert.equal(calls.length, 0);
  });

  it('shows a still change to something that exists as before and after screenshots, side by side at a fixed width, and no video', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const before = sealed({ called: 'before', failed: true });
    const after = sealed({ called: 'after' });
    await attach(deps, { verb: 'attach', run: after.run, pr: 9, media: still, before: before.run });
    assert.equal(
      gh.pr.body,
      block(
        `**Verified on an iOS simulator.** Run \`${after.run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed. Before is run \`${before.run}\` at \`5e1263750651\`, 0 of 1 passed.`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| <img src="${asset(2)}" width="280" alt="Before: profile"> | <img src="${asset(1)}" width="280" alt="After: profile"> |`,
      ),
    );
    assert.deepEqual(gh.edits[0]!.attached, ['after profile', 'before profile']);
  });

  it('shows a still change that is new as its screenshots alone, two across under their labels', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const { run } = sealed({ called: 'after', shots: ['start', 'profile', 'security'] });
    await attach(deps, { verb: 'attach', run, pr: 9, media: { screenshots: ['start', 'profile', 'security'], video: false }, before: null });
    assert.equal(
      gh.pr.body,
      block(
        `**Verified on an iOS simulator.** Run \`${run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.`,
        '',
        '| `start` | `profile` |',
        '| :---: | :---: |',
        `| <img src="${asset(1)}" width="280" alt="start"> | <img src="${asset(2)}" width="280" alt="profile"> |`,
        '',
        '| `security` |',
        '| :---: |',
        `| <img src="${asset(3)}" width="280" alt="security"> |`,
      ),
    );
    assert.deepEqual(gh.edits[0]!.attached, ['after start', 'after profile', 'after security']);
  });

  it('shows a change to a flow that exists as the before and after videos, side by side, and no screenshot', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const before = sealed({ called: 'before', failed: true });
    const after = sealed({ called: 'after' });
    await attach(deps, { verb: 'attach', run: after.run, pr: 9, media: flow, before: before.run });
    assert.equal(
      gh.pr.body,
      block(
        `**Verified on an iOS simulator.** Run \`${after.run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed. Before is run \`${before.run}\` at \`5e1263750651\`, 0 of 1 passed.`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| ${asset(2)} | ${asset(1)} |`,
      ),
    );
    assert.deepEqual(gh.edits[0]!.attached, ['after video', 'before video']);
  });

  it('shows a flow that is new as its video alone, in a table that keeps it from the full width', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const { run } = sealed({ called: 'after' });
    await attach(deps, { verb: 'attach', run, pr: 9, media: flow, before: null });
    assert.equal(gh.pr.body, block(`**Verified on an iOS simulator.** Run \`${run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.`, '', '| `video` |', '| :---: |', `| ${asset(1)} |`));
    assert.deepEqual(gh.edits[0]!.attached, ['after video']);
  });

  it('shows both kinds when asked for both: the screenshots first, then the video, each laid out as it is alone', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const before = sealed({ called: 'before', failed: true });
    const after = sealed({ called: 'after' });
    const both = { screenshots: ['profile'], video: true };
    await attach(deps, { verb: 'attach', run: after.run, pr: 9, media: both, before: before.run });
    assert.equal(
      gh.pr.body,
      block(
        `**Verified on an iOS simulator.** Run \`${after.run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed. Before is run \`${before.run}\` at \`5e1263750651\`, 0 of 1 passed.`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| <img src="${asset(3)}" width="280" alt="Before: profile"> | <img src="${asset(1)}" width="280" alt="After: profile"> |`,
        '',
        '| Before | After |',
        '| :---: | :---: |',
        `| ${asset(4)} | ${asset(2)} |`,
      ),
    );
    assert.deepEqual(gh.edits[0]!.attached, ['after profile', 'after video', 'before profile', 'before video']);

    await attach(deps, { verb: 'attach', run: after.run, pr: 9, media: both, before: null });
    assert.equal(
      gh.pr.body,
      block(
        `**Verified on an iOS simulator.** Run \`${after.run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.`,
        '',
        '| `profile` |',
        '| :---: |',
        `| <img src="${asset(5)}" width="280" alt="profile"> |`,
        '',
        '| `video` |',
        '| :---: |',
        `| ${asset(6)} |`,
      ),
    );
  });

  it('pairs a screenshot with the one of the same label in the before run, and with the failure screenshot of a before run that failed before it took one', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const before = sealed({ called: 'before', failed: true, failureShot: true, shots: ['start'] });
    const after = sealed({ called: 'after', shots: ['start', 'profile'] });
    await attach(deps, { verb: 'attach', run: after.run, pr: 9, media: { screenshots: ['start', 'profile'], video: false }, before: before.run });
    assert.deepEqual(gh.edits[0]!.attached, ['after start', 'after profile', 'before start', 'before failure']);
    assert.deepEqual(gh.pr.body.split('\n').slice(10, 12), [
      `| <img src="${asset(3)}" width="280" alt="Before: start"> | <img src="${asset(1)}" width="280" alt="After: start"> |`,
      `| <img src="${asset(4)}" width="280" alt="Before: profile"> | <img src="${asset(2)}" width="280" alt="After: profile"> |`,
    ]);
  });

  it('posts nothing when the before run has nothing to pair with what was asked for, and says what to do', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const after = sealed({ called: 'after' });
    const passedWithoutIt = sealed({ called: 'before', shots: ['start'] });
    await assert.rejects(attach(deps, { verb: 'attach', run: after.run, pr: 9, media: still, before: passedWithoutIt.run }), {
      code: 'USAGE',
      message: `run ${passedWithoutIt.run} has no screenshot labelled profile, and no failure screenshot to show in its place`,
      fix: "call host.screenshot('profile') in the spec and run it on the build without the change, or attach without --before",
    });
    const noVideo = sealed({ called: 'before', failed: true, video: false });
    await assert.rejects(attach(deps, { verb: 'attach', run: after.run, pr: 9, media: flow, before: noVideo.run }), {
      code: 'USAGE',
      message: `run ${noVideo.run} has no video: a run records one from the first time a test launches the app, unless it has --no-video`,
      fix: '{cli} run it again without --no-video, or attach without --video or without --before',
    });
    const neverLaunched = sealed({ called: 'after', video: false });
    await assert.rejects(attach(deps, { verb: 'attach', run: neverLaunched.run, pr: 9, media: flow, before: null }), {
      code: 'USAGE',
      message: `run ${neverLaunched.run} has no video: a run records one from the first time a test launches the app, unless it has --no-video`,
      fix: '{cli} run a spec that calls host.launch, without --no-video, and attach that run, or attach this one with --screenshot <label>',
    });
    assert.deepEqual(gh.edits, []);
  });

  it('takes a before run that failed, and refuses one that is unsafe to show, is the run itself, is of the other platform, or is not in this checkout', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const after = sealed({ called: 'after' });
    const withBefore = (before: RunId) => attach(deps, { verb: 'attach', run: after.run, pr: 9, media: still, before });

    const foreign = sealed({ called: 'before', failed: true, log: hostLogLine('user_foreign') });
    await assert.rejects(withBefore(foreign.run), { code: 'EVIDENCE_UNSAFE', message: `the app log of run ${foreign.run} names user(s) the run did not create: user_foreign` });
    const tainted = sealed({ called: 'before', failed: true });
    const record = JSON.parse(readFileSync(join(tainted.dir, 'run.json'), 'utf8')) as EvidenceRecord;
    writeFileSync(join(tainted.dir, 'run.json'), JSON.stringify({ ...record, tainted: [join(tainted.dir, 'e2e.log')] }));
    await assert.rejects(withBefore(tainted.run), { code: 'EVIDENCE_UNSAFE', message: `run ${tainted.run} has secret values in ${join(tainted.dir, 'e2e.log')}` });
    const unsealed = sealed({ called: 'before', failed: true });
    rmSync(join(unsealed.dir, 'run.json'));
    await assert.rejects(withBefore(unsealed.run), { code: 'EVIDENCE_UNSAFE', message: /has no run\.json, so it was never sealed$/ });

    await assert.rejects(withBefore(after.run), { code: 'USAGE', message: `--before names run ${after.run} itself` });
    const android = sealed({ called: 'before', failed: true, change: { platform: 'android' } });
    await assert.rejects(withBefore(android.run), { code: 'USAGE', message: `run ${android.run} is an android run and run ${after.run} is an ios run` });
    await assert.rejects(withBefore('r20260101-000000-0000' as RunId), {
      code: 'USAGE',
      message: `no run r20260101-000000-0000 in ${deps.workspace.root}/runs, so its files cannot be shown as the before`,
      fix: 'pass a run that `{cli} run` made in this checkout, whose directory is still there, or attach without --before, and name the before run in the PR',
    });
    assert.deepEqual(gh.edits, []);

    await withBefore(sealed({ called: 'before', failed: true }).run);
    assert.equal(gh.edits.length, 2);
  });

  it('uploads the files as a list under names the description could not have guessed, then writes the tables from the addresses GitHub gave them', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const { run, dir } = sealed({ called: 'after' });
    const result = await attach(deps, { verb: 'attach', run, pr: 9, media: { screenshots: ['profile'], video: true }, before: null });
    const [upload, layout] = gh.edits;
    assert.equal(gh.edits.length, 2);
    assert.deepEqual(upload!.args.slice(0, 5), ['pr', 'edit', '9', '--repo', 'clerk/clerk-ios']);
    const names = upload!.args.filter((_, i) => upload!.args[i - 1] === '--attach');
    const prefix = /^\.\/(evidence-[0-9a-f]{16})-1\.png$/.exec(names[0]!)?.[1];
    assert.deepEqual(names, [`./${prefix}-1.png`, `./${prefix}-2.mp4`]);
    assert.equal(
      upload!.bodyFile,
      block(`**Verified on an iOS simulator.** Run \`${run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.`, '', `![profile](./${prefix}-1.png)`, '', `![video.mp4](./${prefix}-2.mp4)`),
    );
    assert.equal(layout!.args.includes('--attach'), false);
    assert.equal(layout!.bodyFile, gh.pr.body);
    assert.equal(existsSync(upload!.cwd!), false, 'the copies of the files and of the description are not kept');
    assert.deepEqual(result, { verb: 'attach', via: 'gh', prUrl: PR_URL, posted: [join(dir, 'screenshots', 'profile.png'), join(dir, 'video.mp4')], alreadyPosted: false });
  });

  it('leaves the list in the description and says so when the addresses of the files cannot be read back, or the block names another run by then', async () => {
    const gh = fakeGh({ upload: (reference) => reference });
    const { deps, sealed } = checkout(gh);
    const { run } = sealed({ called: 'after' });
    const notLaidOut = {
      code: 'NOT_READY',
      message: `the files of run ${run} are in the description of PR #9 as a list, one under the other, and were not laid out: the block there now does not show run ${run} with the 1 addresses GitHub gave its files`,
      fix: 'rerun {cli} attach once nobody is editing the description',
    };
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), notLaidOut);
    assert.equal(gh.edits.length, 1);

    const renamed = { run: '' };
    const otherRun = fakeGh({ onView: (views, pr) => void (views === 3 && (pr.body = pr.body.replace(renamed.run, 'r20261009-020202-bbbb'))) });
    const elsewhere = checkout(otherRun);
    renamed.run = elsewhere.sealed({ called: 'after' }).run;
    await assert.rejects(attach(elsewhere.deps, { verb: 'attach', run: renamed.run as RunId, pr: 9, media: still, before: null }), { code: 'NOT_READY', message: notLaidOut.message.replaceAll(run, renamed.run) });
    assert.equal(otherRun.edits.length, 1);
    assert.ok(otherRun.pr.body.endsWith(`Run \`r20261009-020202-bbbb\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.\n\n![profile](${asset(1)})\n\n<!-- /verify-evidence:ios -->`), 'the list that names another run is left as it is');
  });

  it('says already posted only while the description holds the block it would write, and writes when the block there is another one or is gone', async () => {
    const gh = fakeGh();
    const { deps, sealed } = checkout(gh);
    const before = sealed({ called: 'before', failed: true });
    const { run } = sealed({ called: 'after' });
    const stills = () => attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null });
    const shows = (n: number) => block(`**Verified on an iOS simulator.** Run \`${run}\` on \`verify-ios-1\` at \`606639a63448\`, 1 of 1 passed.`, '', '| `profile` |', '| :---: |', `| <img src="${asset(n)}" width="280" alt="profile"> |`);

    const first = await stills();
    assert.equal(first.via === 'gh' && first.alreadyPosted, false);
    assert.equal(gh.pr.body, shows(1));
    assert.deepEqual(await stills(), { ...first, alreadyPosted: true });
    gh.pr.body = gh.pr.body.replaceAll('\n', '\r\n');
    assert.deepEqual(await stills(), { ...first, alreadyPosted: true }, 'the same block with the line endings of the web editor');
    assert.equal(gh.edits.length, 2);
    assert.equal(gh.pr.body, shows(1).replaceAll('\n', '\r\n'));

    await attach(deps, { verb: 'attach', run, pr: 9, media: still, before: before.run });
    assert.equal(gh.edits.length, 4);
    assert.deepEqual(await stills(), { ...first, alreadyPosted: false }, 'the block of another choice replaced it');
    assert.equal(gh.edits.length, 6);
    assert.equal(gh.pr.body, shows(4).replaceAll('\n', '\r\n'));

    gh.pr.body = DESCRIPTION;
    assert.deepEqual(await stills(), { ...first, alreadyPosted: false }, 'the block is gone');
    assert.equal(gh.pr.body, shows(5));

    gh.pr.body = gh.pr.body.replace(`<img src="${asset(5)}" width="280" alt="profile">`, `![profile](${asset(5)})`);
    assert.deepEqual(await stills(), { ...first, alreadyPosted: false }, 'the block was never laid out');
    assert.equal(gh.pr.body, shows(6));

    gh.pr.body = gh.pr.body.replace(asset(6), 'https://example.com/other.png');
    assert.deepEqual(await stills(), { ...first, alreadyPosted: false }, 'the block does not show an upload');
    assert.equal(gh.pr.body, shows(7));
    assert.equal(gh.edits.length, 12);
  });

  it('replaces the block of an earlier run, in the layout of this version or of the one before it, so a second run does not pile up media', async () => {
    const older = '<!-- verify-evidence:ios -->\n\nverify run `r20261007-010101-aaaa` on `verify-ios-1` at `abc`, 1 of 1 passed.\n\n![profile](https://github.com/user-attachments/assets/1)\n\n<!-- /verify-evidence:ios -->';
    for (const start of [undefined, `${DESCRIPTION}\n${older}`]) {
      const gh = fakeGh(start === undefined ? {} : { body: start });
      const { deps, sealed } = checkout(gh);
      const earlier = sealed({ called: 'earlier' });
      const later = sealed({ called: 'later' });
      if (start === undefined) await attach(deps, { verb: 'attach', run: earlier.run, pr: 9, media: still, before: null });
      gh.pr.body += '\nReviewer note added below the block.\n';
      await attach(deps, { verb: 'attach', run: later.run, pr: 9, media: still, before: null });
      assert.equal(gh.pr.body.split('<!-- verify-evidence:ios -->').length, 2);
      assert.equal(/r20261007-010101-aaaa/.test(gh.pr.body) || gh.pr.body.includes(earlier.run), false);
      assert.ok(gh.pr.body.includes(later.run));
      assert.ok(gh.pr.body.startsWith(`${DESCRIPTION}\n<!-- verify-evidence:ios -->`));
      assert.ok(gh.pr.body.endsWith('<!-- /verify-evidence:ios -->\nReviewer note added below the block.\n'));
    }
  });

  it('writes nothing to a pull request that is closed or merged, whether it was so before attach started or became so before the write, and says what to do', async () => {
    const refusal = (state: string) => ({
      code: 'USAGE',
      message: `PR #9 of clerk/clerk-ios is ${state}, and attach writes only to an open pull request`,
      fix: 'pass the number of an open pull request as --pr, or reopen PR #9, then rerun {cli} attach',
    });
    for (const [state, closesAtView] of [['CLOSED', 1], ['MERGED', 1], ['CLOSED', 2]] as const) {
      const gh = fakeGh({ onView: (views, pr) => void (views === closesAtView && (pr.state = state)) });
      const { deps, sealed } = checkout(gh);
      const { run } = sealed({ called: 'after' });
      await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), refusal(state.toLowerCase()));
      assert.deepEqual(gh.edits, []);
    }
  });

  it('posts nothing and names the fix when gh pr edit has no --attach', async () => {
    const gh = fakeGh({ attachFlag: false });
    const { deps, sealed } = checkout(gh);
    const { run, dir } = sealed({ called: 'after' });
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), {
      code: 'NOT_READY',
      message: `this gh has no \`gh pr edit --attach\`, so the video and screenshots of run ${run} cannot be posted`,
      fix: 'install gh 2.99.0 or newer, whose `gh pr edit` has --attach',
    });
    assert.deepEqual(gh.edits, []);
  });

  it('builds on the newer description when someone edits it between the read and the write', async () => {
    const gh = fakeGh({ onView: (views, pr) => void (views === 2 && (pr.body = 'Rewritten by a reviewer.\n')) });
    const { deps, sealed } = checkout(gh);
    await attach(deps, { verb: 'attach', run: sealed({ called: 'after' }).run, pr: 9, media: still, before: null });
    assert.equal(gh.edits.length, 2);
    for (const edit of gh.edits) assert.ok(edit.bodyFile.startsWith('Rewritten by a reviewer.\n\n<!-- verify-evidence:ios -->'));
  });

  it('writes nothing when the description changes twice, and says so', async () => {
    const gh = fakeGh({ onView: (views, pr) => void (pr.body = `edit ${views}\n`) });
    const { deps, sealed } = checkout(gh);
    const { run, dir } = sealed({ called: 'after' });
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), {
      code: 'NOT_READY',
      message: `the description of PR #9 changed twice while the evidence of run ${run} was being placed, so nothing was written`,
    });
    assert.deepEqual(gh.edits, []);
  });

  it('writes nothing to a description whose markers are broken, and says which', async () => {
    const gh = fakeGh({ body: 'text\n<!-- verify-evidence:ios -->\nthe end marker was deleted\n' });
    const { deps, sealed } = checkout(gh);
    const { run } = sealed({ called: 'after' });
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, media: still, before: null }), {
      code: 'NOT_READY',
      message: `the description of PR #9 has \`<!-- verify-evidence:ios -->\` 1 times and \`<!-- /verify-evidence:ios -->\` 0 times, so the evidence of run ${run} has no one place to go`,
      fix: 'leave one pair of those markers in the description, or none, then rerun',
    });
    assert.deepEqual(gh.edits, []);
  });
});
