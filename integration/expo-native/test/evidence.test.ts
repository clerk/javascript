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
import { evidenceBlock, evidenceMarkers, postToPullRequest, summarize, withEvidenceBlock } from '../src/core/publish.ts';
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
  const media = [{ alt: 'video.mp4', ref: './video.mp4' }, { alt: 'profile', ref: './profile.png' }];
  const block = evidenceBlock(summary, media);

  it('is one line built from the run, then each file alone in its own paragraph, between the markers of its platform', () => {
    assert.equal(
      block,
      [
        '<!-- verify-evidence:ios -->',
        '',
        'verify run `r20261008-052713-253e` on `iPhone Air on xcode-27` at `0f50b597b1c2`, 3 of 3 passed.',
        '',
        '![video.mp4](./video.mp4)',
        '',
        '![profile](./profile.png)',
        '',
        '<!-- /verify-evidence:ios -->',
      ].join('\n'),
    );
    assert.match(evidenceBlock({ ...summary, passed: 1, flaky: 1, total: 2 }, []), /, 1 of 2 passed, 1 flaky \(passed only on a retry\)\.$/m);
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
    const old = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, [{ alt: 'old', ref: 'https://github.com/user-attachments/assets/1' }]);
    const edit = withEvidenceBlock(`${before}${old}${after}`, 'ios', block);
    assert.deepEqual(edit, { ok: true, body: `${before}${block.replaceAll('\n', '\r\n')}${after}`, was: 'replaced' });
    assert.equal(edit.ok && edit.body.includes('r20261007-010101-aaaa'), false);
  });

  it('keeps the block of the other platform', () => {
    const android = evidenceBlock({ ...summary, platform: 'android', device: 'Pixel 9' }, []);
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
    const old = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, media);
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
    const example = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, media);
    const later = evidenceBlock({ ...summary, run: 'r20261009-020202-bbbb' as RunId }, media);
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
    const real = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, media);
    for (const before of ['```\ncode\n```\n\n', 'Use ```three ticks``` inline.\n\n', '```three ticks``` that open a line are inline code too.\n\n', '    ```\n\n', '``\n\n']) {
      assert.deepEqual(withEvidenceBlock(`${before}${real}\n`, 'ios', block), { ok: true, body: `${before}${block}\n`, was: 'replaced' }, JSON.stringify(before));
    }
  });

  it('opens no fence at a fence line inside an HTML comment, so the next attach finds the block it wrote', () => {
    const later = evidenceBlock({ ...summary, run: 'r20261009-020202-bbbb' as RunId }, media);
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
    const earlier = evidenceBlock({ ...summary, run: 'r20261007-010101-aaaa' as RunId }, media);
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

  function fakeGh(options: { readonly attachFlag?: boolean; readonly body?: string; readonly onView?: (views: number, pr: { body: string }) => void } = {}) {
    const pr = { body: options.body ?? '## Summary\n\nFixes the button.\n' };
    const edits: { readonly args: readonly string[]; readonly cwd: string | undefined; readonly bodyFile: string }[] = [];
    let views = 0;
    const runner: Runner = async (command, args, runOptions) => {
      assert.equal(command, 'gh');
      if (args.includes('--help')) return { code: 0, stdout: options.attachFlag === false ? '  -b, --body text   Set the new body.\n' : '      --attach file   Attach a file\n', stderr: '' };
      if (args[1] === 'view') {
        views += 1;
        options.onView?.(views, pr);
        return { code: 0, stdout: JSON.stringify({ body: pr.body, url: PR_URL }), stderr: '' };
      }
      const bodyFile = readFileSync(args[args.indexOf('--body-file') + 1]!, 'utf8');
      edits.push({ args, cwd: runOptions?.cwd, bodyFile });
      pr.body = bodyFile.replace(/\]\(\.\/[^)]+\)/g, '](https://github.com/user-attachments/assets/uploaded)');
      return { code: 0, stdout: `${PR_URL}\n`, stderr: '' };
    };
    return { runner, pr, edits };
  }

  function publishableRun() {
    const { dir, run } = runDir();
    return { dir, run, publishable: assertPublishable(sealEvidence(dir, partialRecord(dir, run), []), [OWN_USER]) };
  }

  it('never calls gh for a run that fails the gate', async () => {
    const packageDir = mkdtempSync(join(tmpdir(), 'verify-attach-'));
    const workspace = openWorkspace({ packageDir, worktree: packageDir, home: join(packageDir, 'home') });
    const { run, dir } = workspace.newRun();
    writeFileSync(join(dir, 'video.mp4'), 'x');
    writeFileSync(join(dir, 'app.log'), hostLogLine('user_foreign'));
    sealEvidence(dir, partialRecord(dir, run), []);
    const calls: string[] = [];
    const runner: Runner = async (command) => (calls.push(command), { code: 0, stdout: '', stderr: '' });
    const deps = { host, workspace, runner, env: {}, progress: () => undefined, instances: heldInstances() };
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, screenshots: 'all' }), { code: 'EVIDENCE_UNSAFE' });
    assert.equal(calls.length, 0);
  });

  it('puts the block after the description with gh pr edit, from the run directory, and uploads a run only once', async () => {
    const { dir, run, publishable } = publishableRun();
    const gh = fakeGh();
    const first = await postToPullRequest(publishable, dir, host, 9, 'all', gh.runner);
    const second = await postToPullRequest(publishable, dir, host, 9, 'all', gh.runner);
    assert.equal(gh.edits.length, 1);
    const edit = gh.edits[0]!;
    assert.deepEqual(edit.args.slice(0, 5), ['pr', 'edit', '9', '--repo', 'clerk/clerk-ios']);
    assert.deepEqual(edit.args.filter((_, i) => edit.args[i - 1] === '--attach'), ['./video.mp4', './screenshots/profile.png']);
    assert.equal(edit.cwd, dir);
    assert.equal(
      edit.bodyFile,
      `## Summary\n\nFixes the button.\n\n<!-- verify-evidence:ios -->\n\nverify run \`${run}\` on \`verify-ios-1\` at \`abc\`, 1 of 1 passed.\n\n![video.mp4](./video.mp4)\n\n![profile](./screenshots/profile.png)\n\n<!-- /verify-evidence:ios -->`,
    );
    assert.equal(existsSync(edit.args[edit.args.indexOf('--body-file') + 1]!), false, 'the copy of the description is not kept');
    assert.deepEqual(first, { verb: 'attach', via: 'gh', prUrl: PR_URL, posted: [join(dir, 'video.mp4'), join(dir, 'screenshots', 'profile.png')], alreadyPosted: false });
    assert.deepEqual(second, { ...first, alreadyPosted: true });
    assert.ok(existsSync(join(dir, 'posted-9.json')));
    await postToPullRequest(publishable, dir, host, 10, 'all', gh.runner);
    assert.equal(gh.edits[1]!.args[2], '10');
  });

  it('replaces the block of an earlier run, so a second run does not pile up media', async () => {
    const earlier = publishableRun();
    const later = publishableRun();
    const gh = fakeGh();
    await postToPullRequest(earlier.publishable, earlier.dir, host, 9, 'all', gh.runner);
    gh.pr.body += '\nReviewer note added below the block.\n';
    await postToPullRequest(later.publishable, later.dir, host, 9, ['profile'], gh.runner);
    assert.equal(gh.pr.body.split('<!-- verify-evidence:ios -->').length, 2);
    assert.equal(gh.pr.body.includes(earlier.run), false);
    assert.ok(gh.pr.body.includes(later.run));
    assert.ok(gh.pr.body.startsWith('## Summary\n\nFixes the button.\n\n<!-- verify-evidence:ios -->'));
    assert.ok(gh.pr.body.endsWith('<!-- /verify-evidence:ios -->\nReviewer note added below the block.\n'));
  });

  it('posts nothing and names the fix when gh pr edit has no --attach', async () => {
    const { dir, run, publishable } = publishableRun();
    const gh = fakeGh({ attachFlag: false });
    await assert.rejects(postToPullRequest(publishable, dir, host, 9, 'all', gh.runner), {
      code: 'NOT_READY',
      message: `this gh has no \`gh pr edit --attach\`, so the video and screenshots of run ${run} cannot be posted`,
      fix: 'install gh 2.99.0 or newer, whose `gh pr edit` has --attach',
    });
    assert.deepEqual(gh.edits, []);
    assert.equal(existsSync(join(dir, 'posted-9.json')), false);
  });

  it('builds on the newer description when someone edits it between the read and the write', async () => {
    const { dir, publishable } = publishableRun();
    const gh = fakeGh({ onView: (views, pr) => void (views === 2 && (pr.body = 'Rewritten by a reviewer.\n')) });
    await postToPullRequest(publishable, dir, host, 9, 'all', gh.runner);
    assert.equal(gh.edits.length, 1);
    assert.ok(gh.edits[0]!.bodyFile.startsWith('Rewritten by a reviewer.\n\n<!-- verify-evidence:ios -->'));
  });

  it('writes nothing when the description changes twice, and says so', async () => {
    const { dir, run, publishable } = publishableRun();
    const gh = fakeGh({ onView: (views, pr) => void (pr.body = `edit ${views}\n`) });
    await assert.rejects(postToPullRequest(publishable, dir, host, 9, 'all', gh.runner), {
      code: 'NOT_READY',
      message: `the description of PR #9 changed twice while the evidence of run ${run} was being placed, so nothing was written`,
    });
    assert.deepEqual(gh.edits, []);
    assert.equal(existsSync(join(dir, 'posted-9.json')), false);
  });

  it('writes nothing to a description whose markers are broken, and says which', async () => {
    const { dir, run, publishable } = publishableRun();
    const gh = fakeGh({ body: 'text\n<!-- verify-evidence:ios -->\nthe end marker was deleted\n' });
    await assert.rejects(postToPullRequest(publishable, dir, host, 9, 'all', gh.runner), {
      code: 'NOT_READY',
      message: `the description of PR #9 has \`<!-- verify-evidence:ios -->\` 1 times and \`<!-- /verify-evidence:ios -->\` 0 times, so the evidence of run ${run} has no one place to go`,
      fix: 'leave one pair of those markers in the description, or none, then rerun',
    });
    assert.deepEqual(gh.edits, []);
  });
});
