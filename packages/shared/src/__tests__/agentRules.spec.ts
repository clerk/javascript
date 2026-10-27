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

const createMemoryFs = (
  files: Record<string, string> = {},
  {
    withRepoPackageJson = true,
    symlinks = {},
  }: { withRepoPackageJson?: boolean; symlinks?: Record<string, string> } = {},
) => {
  const store = new Map(Object.entries(withRepoPackageJson ? { '/repo/package.json': '{}', ...files } : files));
  const dirs = new Set<string>();
  const follow = (path: string) => symlinks[path] ?? path;

  const fs: FileSystemAdapter = {
    existsSync: path => store.has(follow(path)) || dirs.has(path),
    readFileSync: path => store.get(follow(path)) ?? '',
    writeFileSync: (path, data) => {
      store.set(follow(path), data);
    },
    mkdirSync: path => {
      dirs.add(path);
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

  it('creates AGENTS.md and CLAUDE.md when neither exists', () => {
    const memory = createMemoryFs({ '/repo/app/package.json': '{}' });

    const result = writeClerkAgentRules({
      cwd: '/repo/app',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.agentsMd).toBe('created');
    expect(result.claudeMd).toBe('created');
    expect(memory.read('/repo/app/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
    expect(memory.read('/repo/app/CLAUDE.md')).toBe('@AGENTS.md\n');
    expect(result.files).toEqual(['/repo/app/AGENTS.md', '/repo/app/CLAUDE.md']);
  });

  it('writes nothing when no package.json is at or above the starting folder', () => {
    const memory = createMemoryFs({}, { withRepoPackageJson: false });

    const result = writeClerkAgentRules({ cwd: '/home/user', fs: memory.fs, path: pathAdapter, sdks: ['express'] });

    expect(result).toEqual({ targetDir: '/home/user', agentsMd: 'skipped', claudeMd: 'skipped', files: [] });
    expect(memory.read('/home/user/AGENTS.md')).toBeUndefined();
    expect(memory.read('/home/user/CLAUDE.md')).toBeUndefined();
  });

  it('targets the nearest folder with a package.json when started in a subfolder', () => {
    const memory = createMemoryFs();

    writeClerkAgentRules({ cwd: '/repo/src', fs: memory.fs, path: pathAdapter, sdks: ['react'] });

    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:react -->');
    expect(memory.read('/repo/src/AGENTS.md')).toBeUndefined();
  });

  it('targets the workspace root when one exists', () => {
    const memory = createMemoryFs({
      '/repo/pnpm-workspace.yaml': 'packages:\n  - apps/*\n',
    });

    writeClerkAgentRules({
      cwd: '/repo/apps/web',
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['react'],
    });

    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:react -->');
    expect(memory.read('/repo/apps/web/AGENTS.md')).toBeUndefined();
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

describe('writeClerkAgentRules with an existing CLAUDE.md', () => {
  it('adds an @AGENTS.md import when CLAUDE.md does not load AGENTS.md', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Agent rules\n',
      '/repo/CLAUDE.md': 'Claude rules\n',
    });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.claudeMd).toBe('updated');
    expect(memory.read('/repo/CLAUDE.md')).toBe('Claude rules\n\n@AGENTS.md\n');
    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
  });

  it('adds the import only once across runs', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Agent rules\n',
      '/repo/CLAUDE.md': 'Claude rules\n',
    });

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });
    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.claudeMd).toBe('unchanged');
    expect(memory.read('/repo/CLAUDE.md')).toBe('Claude rules\n\n@AGENTS.md\n');
  });

  it.each(['@AGENTS.md', '@./AGENTS.md'])('leaves CLAUDE.md alone when it already imports %s', importLine => {
    const claude = `Claude rules\n\n${importLine}\n`;
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Agent rules\n',
      '/repo/CLAUDE.md': claude,
    });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.claudeMd).toBe('unchanged');
    expect(memory.read('/repo/CLAUDE.md')).toBe(claude);
  });

  it('leaves CLAUDE.md alone when it mirrors AGENTS.md, as a symlink does', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Shared rules\n',
      '/repo/CLAUDE.md': 'Shared rules\n',
    });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.claudeMd).toBe('unchanged');
    expect(memory.read('/repo/CLAUDE.md')).toBe('Shared rules\n');
  });

  it('keeps the Clerk block when CLAUDE.md is a symlink to an AGENTS.md that does not exist yet', () => {
    const memory = createMemoryFs({}, { symlinks: { '/repo/CLAUDE.md': '/repo/AGENTS.md' } });

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read('/repo/AGENTS.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
    expect(memory.read('/repo/AGENTS.md')).not.toContain('@AGENTS.md');
  });

  it('writes the Clerk block into CLAUDE.md and skips the import when only CLAUDE.md exists', () => {
    const memory = createMemoryFs({ '/repo/CLAUDE.md': 'Claude rules\n' });

    const result = writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(result.agentsMd).toBe('updated');
    expect(memory.read('/repo/AGENTS.md')).toBeUndefined();
    expect(memory.read('/repo/CLAUDE.md')).toContain('<!-- BEGIN:clerk-agent-rules:nextjs -->');
    expect(memory.read('/repo/CLAUDE.md')).not.toContain('@AGENTS.md');
  });

  it('keeps CRLF line endings in CLAUDE.md', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Agent rules\r\n',
      '/repo/CLAUDE.md': 'Claude rules\r\n',
    });

    writeClerkAgentRules({ cwd: '/repo', fs: memory.fs, path: pathAdapter, sdks: ['nextjs'] });

    expect(memory.read('/repo/CLAUDE.md')).toBe('Claude rules\r\n\r\n@AGENTS.md\r\n');
  });

  it('reports the import but does not write it in dry-run mode', () => {
    const memory = createMemoryFs({
      '/repo/AGENTS.md': 'Agent rules\n',
      '/repo/CLAUDE.md': 'Claude rules\n',
    });

    const result = writeClerkAgentRules({
      cwd: '/repo',
      dryRun: true,
      fs: memory.fs,
      path: pathAdapter,
      sdks: ['nextjs'],
    });

    expect(result.claudeMd).toBe('updated');
    expect(memory.read('/repo/CLAUDE.md')).toBe('Claude rules\n');
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
      claudeMd: 'created',
      files: ['/repo/AGENTS.md', '/repo/CLAUDE.md'],
    });

    expect(log).toHaveBeenCalledWith(
      '[Clerk]: Updated /repo/AGENTS.md and /repo/CLAUDE.md for AI coding agents. Set CLERK_AGENTS_MD=false to turn this off.',
    );
    log.mockRestore();
  });

  it('stays quiet when nothing changed', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    logClerkAgentRulesResult({ targetDir: '/repo', agentsMd: 'unchanged', claudeMd: 'unchanged', files: [] });

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
