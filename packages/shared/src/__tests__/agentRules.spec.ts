import { beforeEach, describe, expect, it } from 'vitest';

import {
  CLERK_SDK_PLUGIN_END,
  CLERK_SDK_PLUGIN_START,
  type FileSystemAdapter,
  renderClerkAgentRulesBlock,
  renderClerkSdkPluginBlock,
  writeClerkAgentRules,
} from '../agentRules';

const createMemoryFs = (files: Record<string, string> = {}) => {
  const store = new Map(Object.entries(files));
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
    const memory = createMemoryFs();

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
});
