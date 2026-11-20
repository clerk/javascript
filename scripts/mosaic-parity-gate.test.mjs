import { execFile, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const script = fileURLToPath(new URL('./mosaic-parity-gate.mjs', import.meta.url));
const features = 'packages/mosaic/src/features';
let root;

function write(path, text = 'export {};') {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
}

function git(...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
}

function invoke(input, args = ['write']) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, TMPDIR: root },
  });
}

function edit(path, tool_name = 'Edit', cwd = root) {
  return { cwd, session_id: 'same-session', tool_name, tool_input: { file_path: path } };
}

function patch(lines, cwd = root) {
  return {
    cwd,
    tool_name: 'apply_patch',
    tool_input: { command: ['*** Begin Patch', ...lines, '*** End Patch'].join('\n') },
  };
}

function advisory(result, names) {
  expect(result.status, result.stderr).toBe(0);
  expect(result.stderr).toBe('');
  const output = JSON.parse(result.stdout);
  expect(Object.keys(output)).toEqual(['hookSpecificOutput']);
  expect(Object.keys(output.hookSpecificOutput).sort()).toEqual(['additionalContext', 'hookEventName']);
  expect(output.hookSpecificOutput.hookEventName).toBe('PreToolUse');
  const text = output.hookSpecificOutput.additionalContext;
  expect(text).toContain(names.join(', '));
  expect(text).toMatch(/if.*migrated behavior/i);
  expect(text).toContain('packages/mosaic/docs/migration.md');
  expect(text).toContain('packages/mosaic/docs/parity-audit.md');
  expect(text).not.toMatch(/passed|parity verified|retry|must.*audit/i);
  return text;
}

function silent(result) {
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe('');
  expect(result.stderr).toBe('');
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mosaic-reminder-test-'));
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  write('README.md', 'fixture');
  write('packages/react/src/components/SignOutButton.tsx');
  git('add', '.');
  git('commit', '-qm', 'base');
  git('update-ref', 'refs/remotes/origin/main', 'HEAD');
  write(`${features}/sign-out-button/sign-out-button.model.ts`);
  git('add', '.');
  git('commit', '-qm', 'prior Mosaic work');
  write(`${features}/sign-up-button/sign-up-button.model.ts`);
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('current action scope', () => {
  test('ignores prior committed and untracked Mosaic work during unrelated edits and Stop', () => {
    silent(invoke(edit('packages/shared/src/utils.ts')));
    silent(invoke({ cwd: root, session_id: 'same-session' }, ['stop']));
  });

  test.each(['Edit', 'Write'])('advises on existing feature %s without blocking', tool => {
    advisory(invoke(edit(`${features}/sign-out-button/sign-out-button.model.ts`, tool)), ['sign-out-button']);
  });

  test('advises on new models without requiring notes or counterpart matches', () => {
    advisory(invoke(edit(`${features}/renamed-feature/renamed-feature.model.ts`, 'Write')), ['renamed-feature']);
  });

  test.each(['view.tsx', 'styles.ts', 'test.ts'])('keeps guidance conditional for feature %s', file => {
    advisory(invoke(edit(`${features}/sign-out-button/${file}`)), ['sign-out-button']);
  });

  test('does not carry scope into later unrelated actions in the same session', () => {
    advisory(invoke(edit(`${features}/sign-out-button/view.tsx`)), ['sign-out-button']);
    silent(invoke(edit('README.md')));
    silent(invoke(edit('packages/mosaic/src/primitives/button.tsx')));
  });

  test('normalizes absolute, relative, and nested-cwd paths', () => {
    const path = `${features}/sign-out-button/view.tsx`;
    const first = advisory(invoke(edit(path)), ['sign-out-button']);
    expect(advisory(invoke(edit(join(root, path))), ['sign-out-button'])).toBe(first);
    expect(
      advisory(invoke(edit('src/features/sign-out-button/view.tsx', 'Edit', join(root, 'packages/mosaic'))), [
        'sign-out-button',
      ]),
    ).toBe(first);
  });

  test('collects add, update, delete and move scopes in one sorted unique advisory', () => {
    const text = advisory(
      invoke(
        patch([
          `*** Add File: ${features}/new-feature/model.ts`,
          '+export {};',
          `*** Update File: ${join(root, features)}/sign-out-button/view.tsx`,
          `*** Move to: ${features}/renamed-feature/view.tsx`,
          '@@',
          '-old',
          '+new',
          `*** Delete File: ${features}/deleted-feature/model.ts`,
          '*** Add File: README.md',
          '+unrelated',
          `*** Update File: ${features}/new-feature/view.tsx`,
          '@@',
          '-old',
          '+new',
          '*** Delete File: /elsewhere/packages/mosaic/src/features/outside/view.tsx',
        ]),
      ),
      ['deleted-feature', 'new-feature', 'renamed-feature', 'sign-out-button'],
    );
    expect(text).not.toContain('outside');
  });

  test.each([
    '/elsewhere/packages/mosaic/src/features/outside/view.tsx',
    '../packages/mosaic/src/features/outside/view.tsx',
    'packages/mosaic/src/features/../../shared.ts',
    'packages/mosaic/src/features-extra/outside/view.tsx',
  ])('ignores paths outside feature scope: %s', path => silent(invoke(edit(path))));

  test('populated notes neither suppress guidance nor prove success', () => {
    write(
      'tmp/mosaic-parity/sign-out-button.md',
      'packages/react/src/components/SignOutButton.tsx\n## Inventory\nComplete\n## Parity audit\nPassed',
    );
    advisory(invoke(edit(`${features}/sign-out-button/new.model.ts`, 'Write')), ['sign-out-button']);
  });
});

describe('invalid hook input', () => {
  test.each(['{', 'null', '[]', '"text"', '{}'])('silently ignores %s', input => silent(invoke(input)));
  test.each([
    { tool_name: 'Edit', tool_input: null },
    { tool_name: 'Edit', tool_input: { file_path: 1 } },
    { tool_name: 'Edit', tool_input: { file_path: `${features}/x/view\0.ts` } },
    {
      tool_name: 'apply_patch',
      tool_input: { command: `*** Begin Patch\n*** Add File: ${features}/x/view\0.ts\n+text\n*** End Patch` },
    },
    { tool_name: 'Bash', tool_input: { file_path: `${features}/x/x.ts` } },
    { tool_name: 'Bash', tool_input: { command: `*** Begin Patch\n*** Add File: ${features}/x/x.ts\n*** End Patch` } },
    { tool_name: 'apply_patch', tool_input: { command: `echo hi\n*** Add File: ${features}/x/x.ts` } },
    { tool_name: 'apply_patch', tool_input: { command: `*** Begin Patch\n*** Add File: ${features}/x/x.ts` } },
  ])('ignores malformed or unsupported payload %#', input => silent(invoke({ cwd: root, ...input })));

  test('requires a valid cwd and Git root', () => {
    const input = edit(`${features}/x/x.ts`);
    delete input.cwd;
    silent(invoke(input));
    silent(invoke({ ...input, cwd: 42 }));
    silent(invoke({ ...input, cwd: `${root}\0` }));
    silent(invoke({ ...input, cwd: tmpdir() }));
    silent(invoke({ ...input, cwd: join(root, 'absent') }));
  });
});

describe('explicit read-only review', () => {
  test('prints sorted scope without modifying files or registering future scope', () => {
    const before = readdirSync(root, { recursive: true }).sort();
    const status = git('status', '--porcelain', '--untracked-files=all');
    const result = invoke('', ['review', 'sign-up-button', 'historical-feature', 'sign-up-button']);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('historical-feature, sign-up-button');
    expect(result.stdout).toContain('packages/mosaic/docs/parity-audit.md');
    expect(result.stdout).not.toMatch(/if.*migrated behavior|passed|verified/i);
    expect(readdirSync(root, { recursive: true }).sort()).toEqual(before);
    expect(git('status', '--porcelain', '--untracked-files=all')).toBe(status);
    silent(invoke(edit('README.md')));
  });

  test.each([[], ['../x'], ['X'], ['x/y'], ['--help'], ['x', ''], ['-x'], ['x--y']])(
    'rejects invalid review arguments %j',
    (...args) => {
      const result = invoke('', ['review', ...args]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Usage:');
      expect(result.stdout).toBe('');
    },
  );

  test('repeated and concurrent invocations stay independent and create no state', async () => {
    const before = readdirSync(root, { recursive: true }).sort();
    const inputs = ['alpha', 'beta', 'alpha'];
    const results = await Promise.all(
      inputs.map(name => {
        const run = promisify(execFile)(process.execPath, [script, 'review', name], {
          cwd: root,
          env: { ...process.env, TMPDIR: root },
          timeout: 2000,
        });
        run.child.stdin.end();
        return run;
      }),
    );
    results.forEach((result, index) => {
      expect(result.stdout).toContain(inputs[index]);
      expect(result.stdout).not.toContain(inputs[index] === 'alpha' ? 'beta' : 'alpha');
    });
    for (let count = 0; count < 4; count++) {
      advisory(invoke(edit(`${features}/sign-out-button/view.tsx`)), ['sign-out-button']);
    }
    expect(readdirSync(root, { recursive: true }).sort()).toEqual(before);
  });
});

describe('hook registration', () => {
  test.each(['.claude/settings.json', '.codex/hooks.json'])(
    '%s retains lint hooks and uses only current-action parity advice',
    path => {
      const config = JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
      const stop = config.hooks.Stop.flatMap(entry => entry.hooks);
      expect(stop).toHaveLength(2);
      expect(stop.every(hook => hook.timeout === 180 && hook.command.includes('pnpm lint'))).toBe(true);
      expect(stop.some(hook => hook.command.includes('packages/mosaic'))).toBe(true);
      expect(stop.some(hook => hook.command.includes('packages/swingset'))).toBe(true);
      expect(config.hooks.UserPromptSubmit).toBeUndefined();
      expect(config.hooks.PostToolUse).toBeUndefined();
      const pre = config.hooks.PreToolUse;
      expect(pre).toHaveLength(1);
      expect(pre[0].matcher).toBe(path.startsWith('.claude') ? 'Write|Edit' : 'apply_patch|Edit|Write');
      expect(pre[0].hooks[0].if).toBeUndefined();
      expect(pre[0].hooks).toEqual([
        {
          type: 'command',
          command: 'node "$(git rev-parse --show-toplevel)/scripts/mosaic-parity-gate.mjs" write',
          timeout: 10,
        },
      ]);
      if (path.startsWith('.claude')) {
        expect(config.disableBypassPermissionsMode).toBe(true);
        expect(config.permissions.deny).toHaveLength(20);
        expect(config.hooks.SessionStart).toHaveLength(1);
      }
    },
  );
});
