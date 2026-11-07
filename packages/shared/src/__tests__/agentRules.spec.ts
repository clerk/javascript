import { createHash } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CLERK_SDK_PLUGIN_END,
  CLERK_SDK_PLUGIN_START,
  type FileSystemAdapter,
  isClerkAgentRulesSdk,
  logClerkAgentRulesResult,
  renderClerkAgentRulesBlock,
  renderClerkSdkPluginBlock,
  writeClerkAgentRules,
} from '../agentRules';
import { agentEnvironmentVariables } from '../utils/runtimeEnvironment';

beforeEach(() => {
  for (const name of agentEnvironmentVariables) {
    vi.stubEnv(name, '');
  }
  vi.stubEnv('CLAUDECODE', '1');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const createMemoryFs = (files: Record<string, string> = {}, { withRepoPackageJson = true } = {}) => {
  const store = new Map(Object.entries(withRepoPackageJson ? { '/repo/package.json': '{}', ...files } : files));
  const dirs = new Set<string>();

  const fs: FileSystemAdapter = {
    existsSync: path => store.has(path) || dirs.has(path),
    readFileSync: path => store.get(path) ?? '',
    writeFileSync: (path, data) => {
      store.set(path, data);
    },
    mkdirSync: path => {
      dirs.add(path);
    },
    unlinkSync: path => {
      store.delete(path);
    },
  };

  return {
    fs,
    read(path: string) {
      return store.get(path);
    },
  };
};

const pathAdapter = {
  dirname(path: string) {
    const normalized = path.replace(/\/+$/, '');
    const index = normalized.lastIndexOf('/');
    return index <= 0 ? '/' : normalized.slice(0, index);
  },
  join(...paths: string[]) {
    return paths.join('/').replace(/\/+/g, '/');
  },
  parse() {
    return { root: '/' };
  },
  resolve(...paths: string[]) {
    return paths.join('/').replace(/\/+/g, '/');
  },
};

describe('writeClerkAgentRules', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  it('creates AGENTS.md when it does not exist', () => {
    const memory = createMemoryFs({ '/repo/app/package.json': '{}' });

    const result = writeClerkAgentRules({
      cwd: '/repo/app',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.agentsMd).toBe('created');
    expect(memory.read('/repo/app/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
    expect(memory.read('/repo/app/CLAUDE.md')).toBeUndefined();
    expect(result.files).toEqual(['/repo/app/AGENTS.md']);
  });

  it('leaves CLAUDE.md alone', () => {
    const memory = createMemoryFs({ '/repo/CLAUDE.md': 'Claude rules\n' });

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read('/repo/CLAUDE.md')).toBe('Claude rules\n');
    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
  });

  it('writes nothing when no package.json is at or above the starting folder', () => {
    const memory = createMemoryFs({}, { withRepoPackageJson: false });

    const result = writeClerkAgentRules({ cwd: '/home/user', fs: memory.fs, path: pathAdapter, sdks: ['express'] });

    expect(result).toEqual({ targetDir: '/home/user', agentsMd: 'skipped', files: [] });
    expect(memory.read('/home/user/AGENTS.md')).toBeUndefined();
  });

  it('targets the nearest folder with a package.json when started in a subfolder', () => {
    const memory = createMemoryFs();

    writeClerkAgentRules({ cwd: '/repo/src', fs: memory.fs, path: pathAdapter, sdks: ['react'] });

    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:react -->');
    expect(memory.read('/repo/src/AGENTS.md')).toBeUndefined();
  });

  it('replaces only Clerk blocks and preserves surrounding content', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Project rules\n\n<!-- BEGIN:clerk-agent-rules -->\nold\n<!-- END:clerk-agent-rules -->\n',
    });

    writeClerkAgentRules({
      cwd: '/repo',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['vue'],
    });

    const content = memory.read('/repo/AGENTS.md');
    expect(content).toContain('Project rules');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:vue -->');
    expect(content).not.toContain('\nold\n');
  });

  it('writes SDK blocks in sorted order', () => {
    const memory = createMemoryFs();

    writeClerkAgentRules({
      cwd: '/repo',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['vue', 'astro', 'react'],
    });

    const content = memory.read('/repo/AGENTS.md') ?? '';
    const positions = ['astro', 'react', 'vue'].map(sdk => content.indexOf(`<!-- BEGIN:clerk-agent-rules:${sdk} -->`));
    expect(positions.every(position => position !== -1)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not write files in dry-run mode', () => {
    const memory = createMemoryFs();

    const result = writeClerkAgentRules({
      cwd: '/repo',
      dryRun: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['astro'],
    });

    expect(result.agentsMd).toBe('created');
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });
});

describe('writeClerkAgentRules in a monorepo', () => {
  const createMonorepo = (files: Record<string, string> = {}) =>
    createMemoryFs({
      '/repo/package.json': '{"name":"root","private":true}',
      '/repo/pnpm-workspace.yaml': 'packages:\n  - apps/*\n',
      '/repo/apps/web/package.json': '{"name":"web"}',
      '/repo/apps/web/node_modules/@clerk/react/package.json': '{}',
      '/repo/apps/ext/package.json': '{"name":"ext"}',
      '/repo/apps/ext/node_modules/@clerk/chrome-extension/package.json': '{}',
      ...files,
    });

  const writeWeb = (memory: ReturnType<typeof createMemoryFs>) =>
    writeClerkAgentRules({ cwd: '/repo/apps/web', fs: memory.fs, path: pathAdapter, sdks: ['react'] });
  const writeExt = (memory: ReturnType<typeof createMemoryFs>) =>
    writeClerkAgentRules({ cwd: '/repo/apps/ext', fs: memory.fs, path: pathAdapter, sdks: ['chrome-extension'] });

  it('writes one section per app to the AGENTS.md at the repo root', () => {
    const memory = createMonorepo();

    writeWeb(memory);
    const result = writeExt(memory);

    const content = memory.read('/repo/AGENTS.md');
    expect(result.targetDir).toBe('/repo');
    expect(content?.match(/<!-- BEGIN:clerk-agent-rules -->/g)).toHaveLength(1);
    expect(content).toContain('### Clerk + React in `apps/web`');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:react:apps/web -->');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:chrome-extension:apps/ext -->');
    expect(content?.indexOf('react:apps/web')).toBeLessThan(content?.indexOf('chrome-extension:apps/ext') ?? 0);
    expect(memory.read('/repo/apps/web/AGENTS.md')).toBeUndefined();
  });

  it('points each section at the copy of the SDK that app installed', () => {
    const memory = createMonorepo({ '/repo/node_modules/@clerk/chrome-extension/package.json': '{}' });

    writeWeb(memory);
    writeClerkAgentRules({ cwd: '/repo/apps/web', fs: memory.fs, path: pathAdapter, sdks: ['react'] });
    writeClerkAgentRules({
      cwd: '/repo/apps/ext',
      fs: {
        ...memory.fs,
        existsSync: path =>
          path !== '/repo/apps/ext/node_modules/@clerk/chrome-extension/package.json' && memory.fs.existsSync(path),
      },
      path: pathAdapter,
      sdks: ['chrome-extension'],
    });

    const content = memory.read('/repo/AGENTS.md');
    expect(content).toContain('Read `apps/web/node_modules/@clerk/react/AGENTS.md` before writing auth code.');
    expect(content).toContain('Read `node_modules/@clerk/chrome-extension/AGENTS.md` before writing auth code.');
  });

  it('finds the repo root from package.json workspaces', () => {
    const memory = createMemoryFs(
      {
        '/repo/package.json': '{"workspaces":["apps/*"]}',
        '/repo/apps/web/package.json': '{}',
      },
      { withRepoPackageJson: false },
    );

    writeClerkAgentRules({ cwd: '/repo/apps/web/src', fs: memory.fs, path: pathAdapter, sdks: ['react'] });

    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:react:apps/web -->');
  });

  it('turns off one app from its own package.json and keeps writing for the others', () => {
    const memory = createMonorepo();
    writeWeb(memory);
    writeExt(memory);
    memory.fs.writeFileSync('/repo/apps/web/package.json', '{"clerk":{"agentsMd":false}}', { encoding: 'utf8' });

    expect(writeWeb(memory)).toEqual({ targetDir: '/repo', agentsMd: 'disabled', files: ['/repo/AGENTS.md'] });
    writeExt(memory);

    const content = memory.read('/repo/AGENTS.md');
    expect(content).not.toContain('react:apps/web');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules -->');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:chrome-extension:apps/ext -->');
  });

  it('removes the intro section and the file when the last app turns off', () => {
    const memory = createMonorepo();
    writeWeb(memory);
    memory.fs.writeFileSync('/repo/apps/web/package.json', '{"clerk":{"agentsMd":false}}', { encoding: 'utf8' });

    writeWeb(memory);

    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });

  it('turns off every app from the repo root package.json', () => {
    const memory = createMonorepo();
    memory.fs.writeFileSync('/repo/AGENTS.md', 'Project rules\n', { encoding: 'utf8' });
    writeWeb(memory);
    writeExt(memory);
    memory.fs.writeFileSync('/repo/package.json', '{"clerk":{"agentsMd":false}}', { encoding: 'utf8' });

    writeExt(memory);
    writeWeb(memory);

    expect(memory.read('/repo/AGENTS.md')).toBe('Project rules\n');
  });

  it('keeps a newer intro written by an app on a newer Clerk version', () => {
    const newerIntro =
      '<!-- BEGIN:clerk-agent-rules -->\n<!-- clerk-agent-rules-version: 999 -->\n\nNewer intro\n\n<!-- END:clerk-agent-rules -->\n';
    const memory = createMonorepo({ '/repo/AGENTS.md': newerIntro });

    writeExt(memory);

    const content = memory.read('/repo/AGENTS.md');
    expect(content?.startsWith(newerIntro.trimEnd())).toBe(true);
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:chrome-extension:apps/ext -->');
  });

  it('replaces an older intro', () => {
    const memory = createMonorepo({
      '/repo/AGENTS.md':
        '<!-- BEGIN:clerk-agent-rules -->\n<!-- clerk-agent-rules-version: 0 -->\n\nOlder intro\n\n<!-- END:clerk-agent-rules -->\n',
    });

    writeExt(memory);

    expect(memory.read('/repo/AGENTS.md')).not.toContain('Older intro');
    expect(memory.read('/repo/AGENTS.md')).toContain('## Clerk: your training data is out of date');
  });

  it('keeps a removed app section out without blocking the other apps', () => {
    const memory = createMonorepo();
    writeWeb(memory);
    writeExt(memory);
    const content = memory.read('/repo/AGENTS.md') ?? '';
    const start = content.indexOf('<!-- BEGIN:clerk-agent-rules:react:apps/web -->');
    const endMarker = '<!-- END:clerk-agent-rules:react:apps/web -->';
    const end = content.indexOf(endMarker) + endMarker.length;
    memory.fs.writeFileSync('/repo/AGENTS.md', content.slice(0, start) + content.slice(end), { encoding: 'utf8' });

    writeWeb(memory);
    writeExt(memory);

    expect(memory.read('/repo/AGENTS.md')).not.toContain('react:apps/web');
    expect(memory.read('/repo/AGENTS.md')).toContain('chrome-extension:apps/ext');
  });
});

describe('writeClerkAgentRules without a detected AI agent', () => {
  beforeEach(() => {
    vi.stubEnv('CLAUDECODE', '');
  });

  it('writes nothing and records nothing when the repo has no agent files', () => {
    const memory = createMemoryFs();

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result).toEqual({ targetDir: '/repo', agentsMd: 'skipped', files: [] });
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
    expect(memory.read('/repo/node_modules/.cache/clerk/agent-rules/clerk-agent-rules')).toBeUndefined();
  });

  it.each(['/repo/CLAUDE.md', '/repo/.github/copilot-instructions.md', '/repo/apps/web/GEMINI.md'])(
    'writes when the repo has agent files such as %s',
    file => {
      const memory = createMemoryFs({ '/repo/.git': '', '/repo/apps/web/package.json': '{}', [file]: '' });

      const result = writeClerkAgentRules({
        cwd: '/repo/apps/web',
        fs: memory.fs,
        path: pathAdapter,
        sdks: ['nextjs'],
      });

      expect(result.agentsMd).toBe('created');
    },
  );

  it('ignores agent files above the repo, such as a home folder .claude', () => {
    const memory = createMemoryFs(
      { '/home/user/.claude': '', '/home/user/app/.git': '', '/home/user/app/package.json': '{}' },
      { withRepoPackageJson: false },
    );

    const result = writeClerkAgentRules({ cwd: '/home/user/app', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.agentsMd).toBe('skipped');
  });

  it('writes on a later run once an agent is detected', () => {
    const memory = createMemoryFs();
    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    vi.stubEnv('CLAUDECODE', '1');
    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.agentsMd).toBe('created');
  });

  it('writes when forced', () => {
    const memory = createMemoryFs();

    const result = writeClerkAgentRules({
      cwd: '/repo',
      force: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.agentsMd).toBe('created');
  });
});

describe('writeClerkAgentRules with an unmatched BEGIN marker', () => {
  it('keeps text after an orphan shared BEGIN marker across runs', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Team rules\n\n<!-- BEGIN:clerk-agent-rules -->\nold\n\n## My notes\nKeep this.\n',
    });

    for (let run = 0; run < 2; run++) {
      writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

      const content = memory.read('/repo/AGENTS.md');
      expect(content).toContain('Keep this.');
      expect(content?.match(/<!-- BEGIN:clerk-agent-rules -->/g)).toHaveLength(1);
    }
  });

  it('keeps text after an orphan SDK BEGIN marker across runs', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': '<!-- BEGIN:clerk-agent-rules:nextjs -->\nold\n\n## My notes\nKeep this.\n',
    });

    for (let run = 0; run < 2; run++) {
      writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

      const content = memory.read('/repo/AGENTS.md');
      expect(content).toContain('Keep this.');
      expect(content?.match(/<!-- BEGIN:clerk-agent-rules:nextjs -->/g)).toHaveLength(1);
    }
  });
});

describe('writeClerkAgentRules after the user removes the Clerk section', () => {
  const statePath = '/repo/node_modules/.cache/clerk/agent-rules/clerk-agent-rules';

  it('records that it wrote the section', () => {
    const memory = createMemoryFs();

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read(statePath)).toBe('');
  });

  it('does not add the section back once it was removed', () => {
    const memory = createMemoryFs();
    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });
    memory.fs.writeFileSync('/repo/AGENTS.md', 'Project rules\n', { encoding: 'utf8' });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result).toEqual({ targetDir: '/repo', agentsMd: 'skipped', files: [] });
    expect(memory.read('/repo/AGENTS.md')).toBe('Project rules\n');
  });

  it('keeps updating the section while it is still there', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': '<!-- BEGIN:clerk-agent-rules -->\nold\n<!-- END:clerk-agent-rules -->\n',
      [statePath]: '',
    });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.agentsMd).toBe('updated');
    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
  });

  it('adds the section back when forced', () => {
    const memory = createMemoryFs({ '/repo/AGENTS.md': 'Project rules\n', [statePath]: '' });

    const result = writeClerkAgentRules({
      cwd: '/repo',
      force: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.agentsMd).toBe('updated');
    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
  });

  it('records nothing in dry-run mode', () => {
    const memory = createMemoryFs();

    writeClerkAgentRules({ cwd: '/repo', dryRun: true, fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read(statePath)).toBeUndefined();
  });
});

describe('writeClerkAgentRules when package.json sets clerk.agentsMd to false', () => {
  const disabledPackageJson = '{"clerk":{"agentsMd":false}}';

  it('does not create AGENTS.md', () => {
    const memory = createMemoryFs({ '/repo/package.json': disabledPackageJson });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result).toEqual({ targetDir: '/repo', agentsMd: 'disabled', files: [] });
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });

  it('removes existing Clerk sections and keeps the rest of the file', () => {
    const memory = createMemoryFs();
    memory.fs.writeFileSync('/repo/AGENTS.md', 'Project rules\n', { encoding: 'utf8' });
    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs', 'react'] });
    memory.fs.writeFileSync('/repo/AGENTS.md', `${memory.read('/repo/AGENTS.md')}\nMore rules\n`, { encoding: 'utf8' });
    memory.fs.writeFileSync('/repo/package.json', disabledPackageJson, { encoding: 'utf8' });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result).toEqual({ targetDir: '/repo', agentsMd: 'disabled', files: ['/repo/AGENTS.md'] });
    expect(memory.read('/repo/AGENTS.md')).toBe('Project rules\n\nMore rules\n');
  });

  it('deletes AGENTS.md when it held only Clerk sections', () => {
    const memory = createMemoryFs();
    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });
    memory.fs.writeFileSync('/repo/package.json', disabledPackageJson, { encoding: 'utf8' });

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });

  it('wins over a forced write', () => {
    const memory = createMemoryFs({ '/repo/package.json': disabledPackageJson });

    const result = writeClerkAgentRules({
      cwd: '/repo',
      force: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.agentsMd).toBe('disabled');
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });

  it('reports the removal but changes nothing in dry-run mode', () => {
    const memory = createMemoryFs();
    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });
    const before = memory.read('/repo/AGENTS.md');
    memory.fs.writeFileSync('/repo/package.json', disabledPackageJson, { encoding: 'utf8' });

    const result = writeClerkAgentRules({
      cwd: '/repo',
      dryRun: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.files).toEqual(['/repo/AGENTS.md']);
    expect(memory.read('/repo/AGENTS.md')).toBe(before);
  });

  it('writes as usual when package.json is not valid JSON', () => {
    const memory = createMemoryFs({ '/repo/package.json': '{' });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.agentsMd).toBe('created');
  });
});

describe('isClerkAgentRulesSdk', () => {
  it('accepts supported SDKs', () => {
    expect(isClerkAgentRulesSdk('nextjs')).toBe(true);
  });

  it('rejects inherited object keys', () => {
    expect(isClerkAgentRulesSdk('constructor')).toBe(false);
    expect(isClerkAgentRulesSdk('toString')).toBe(false);
  });
});

describe('logClerkAgentRulesResult', () => {
  it('logs the files that changed', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logClerkAgentRulesResult({
      targetDir: '/repo',
      agentsMd: 'created',
      files: ['/repo/AGENTS.md'],
    });

    expect(log).toHaveBeenCalledWith(
      '[Clerk]: Updated /repo/AGENTS.md for AI coding agents. To turn this off for everyone, add "clerk": { "agentsMd": false } to package.json. To turn it off on this machine, remove the Clerk section from AGENTS.md or set CLERK_AGENTS_MD=false.',
    );
  });

  it('logs a removal when package.json turns the rules off', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logClerkAgentRulesResult({ targetDir: '/repo', agentsMd: 'disabled', files: ['/repo/AGENTS.md'] });

    expect(log).toHaveBeenCalledWith(
      '[Clerk]: Removed the Clerk section from /repo/AGENTS.md because package.json sets "clerk": { "agentsMd": false }.',
    );
    log.mockRestore();
  });

  it('stays quiet when nothing changed', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logClerkAgentRulesResult({ targetDir: '/repo', agentsMd: 'unchanged', files: [] });

    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});

describe('Clerk plugin rules', () => {
  it('recommends the Clerk plugin and keeps the ask-before-changes rule in the root block', () => {
    const block = renderClerkAgentRulesBlock();

    expect(block).toContain('### Clerk plugin');
    expect(block).toContain('npx plugins add clerk/skills');
    expect(block).toContain('https://clerk.com/docs/guides/ai/overview');
    expect(block).toContain('https://github.com/clerk/skills');
    expect(block).toContain('Ask the user before calling any Clerk tool');
    expect(block).not.toContain('mcp.clerk.com');
  });

  it('renders a marked per-SDK plugin block with the docs entry point', () => {
    const block = renderClerkSdkPluginBlock();

    expect(block.startsWith(CLERK_SDK_PLUGIN_START)).toBe(true);
    expect(block.endsWith(CLERK_SDK_PLUGIN_END)).toBe(true);
    expect(block).toContain('npx plugins add clerk/skills');
    expect(block).toContain('https://clerk.com/docs/llms.txt');
  });

  it('uses the requested line endings', () => {
    expect(renderClerkSdkPluginBlock('\r\n')).not.toMatch(/[^\r]\n/);
  });

  it('pairs the intro text with its version, so changing the text needs a version bump', () => {
    const block = renderClerkAgentRulesBlock();
    const version = block.match(/<!-- clerk-agent-rules-version: (\d+) -->/)?.[1];
    const sha256 = createHash('sha256')
      .update(block.replace(/<!-- clerk-agent-rules-version: \d+ -->/, ''))
      .digest('hex');

    expect({ version, sha256 }).toEqual({
      version: '1',
      sha256: '4a7270844bdc65fe7388d963470fc91f6cf047cc916db4a3dc423811996b206c',
    });
  });

  it('links agents to the Markdown Clerk docs in the root block', () => {
    expect(renderClerkAgentRulesBlock()).toContain('Clerk docs: https://clerk.com/docs.md');
  });
});
