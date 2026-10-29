import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('targets the app package instead of the workspace root', () => {
    const memory = createMemoryFs({
      '/repo/pnpm-workspace.yaml': 'packages:\n  - apps/*\n',
      '/repo/apps/web/package.json': '{}',
    });

    writeClerkAgentRules({
      cwd: '/repo/apps/web',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['react'],
    });

    expect(memory.read('/repo/apps/web/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:react -->');
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
  });

  it('points to an SDK AGENTS.md that exists when the SDK is installed in a pnpm workspace app', () => {
    const memory = createMemoryFs({
      '/repo/pnpm-workspace.yaml': 'packages:\n  - apps/*\n',
      '/repo/package.json': '{"name":"root","private":true}',
      '/repo/apps/web/package.json': '{"name":"web","dependencies":{"@clerk/nextjs":"*"}}',
      '/repo/apps/web/node_modules/@clerk/nextjs/AGENTS.md': '# Clerk Next.js',
    });

    const { files } = writeClerkAgentRules({
      cwd: '/repo/apps/web',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    const agentsMdPath = files.find(file => file.endsWith('/AGENTS.md')) ?? '';
    const pointer = memory.read(agentsMdPath)?.match(/`(node_modules\/@clerk\/nextjs\/AGENTS\.md)`/)?.[1] ?? '';

    expect(pointer).toBe('node_modules/@clerk/nextjs/AGENTS.md');
    expect(memory.fs.existsSync(pathAdapter.join(pathAdapter.dirname(agentsMdPath), pointer))).toBe(true);
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
  const statePath = '/repo/node_modules/.cache/clerk/agent-rules';

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

  it('links agents to the Markdown Clerk docs in the root block', () => {
    expect(renderClerkAgentRulesBlock()).toContain('Clerk docs: https://clerk.com/docs.md');
  });
});
