import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { detectClerkAgentRuleSdks, writeClerkAgentRules } from '../../util/agent-rules.js';

describe('detectClerkAgentRuleSdks', () => {
  let root;

  const writePackage = (dir, pkg) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-upgrade-agent-rules-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('includes SDKs declared in the workspace root package.json', () => {
    writePackage(root, { name: 'app', workspaces: ['packages/*'], dependencies: { '@clerk/nextjs': '^7.0.0' } });
    writePackage(path.join(root, 'packages', 'ui'), { name: 'ui', dependencies: { react: '^19.0.0' } });

    expect(detectClerkAgentRuleSdks(root)).toEqual(['nextjs']);
  });

  it('combines SDKs from the workspace root and its packages', () => {
    writePackage(root, { name: 'app', workspaces: ['packages/*'], dependencies: { '@clerk/nextjs': '^7.0.0' } });
    writePackage(path.join(root, 'packages', 'api'), { name: 'api', dependencies: { '@clerk/express': '^2.0.0' } });

    expect(detectClerkAgentRuleSdks(path.join(root, 'packages', 'api'))).toEqual(['express', 'nextjs']);
  });
});

describe('writeClerkAgentRules', () => {
  let root;

  const writePackage = (dir, pkg) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  };

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-upgrade-agent-rules-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('writes one section per workspace app to the AGENTS.md at the root', () => {
    writePackage(root, { name: 'root', workspaces: ['apps/*'] });
    writePackage(path.join(root, 'apps', 'web'), { name: 'web', dependencies: { '@clerk/react': '^6.0.0' } });
    writePackage(path.join(root, 'apps', 'ext'), {
      name: 'ext',
      dependencies: { '@clerk/chrome-extension': '^3.0.0' },
    });

    const result = writeClerkAgentRules({ dir: root });

    const content = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
    expect(result).toMatchObject({ targetDir: root, agentsMd: 'created', sdks: ['chrome-extension', 'react'] });
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:react:apps/web -->');
    expect(content).toContain('<!-- BEGIN:clerk-agent-rules:chrome-extension:apps/ext -->');
    expect(fs.existsSync(path.join(root, 'apps', 'web', 'AGENTS.md'))).toBe(false);
  });
});
