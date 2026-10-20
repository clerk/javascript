import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

import { agentEnvironmentVariables, automatedEnvironmentVariables } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const nodeRequire = createRequire(import.meta.url);
const pluginPath = nodeRequire.resolve('../../app.plugin.js');

const loadMaybeWriteAgentRules = () => {
  delete nodeRequire.cache[pluginPath];
  return nodeRequire(pluginPath)._testing.maybeWriteAgentRules;
};

describe('maybeWriteAgentRules', () => {
  let projectRoot;

  beforeEach(() => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-agent-rules-'));
    fs.writeFileSync(path.join(projectRoot, 'package.json'), '{}');
    for (const name of [...agentEnvironmentVariables, ...automatedEnvironmentVariables]) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  const agentsMdPath = () => path.join(projectRoot, 'AGENTS.md');
  const config = () => ({ _internal: { projectRoot } });

  test('writes the Expo rules once per process under an AI agent', () => {
    vi.stubEnv('CLAUDECODE', '1');
    const maybeWriteAgentRules = loadMaybeWriteAgentRules();

    maybeWriteAgentRules(config());
    expect(fs.readFileSync(agentsMdPath(), 'utf8')).toContain('<!-- BEGIN:clerk-agent-rules:expo -->');

    fs.rmSync(agentsMdPath());
    maybeWriteAgentRules(config());
    expect(fs.existsSync(agentsMdPath())).toBe(false);
  });

  test('skips when the agent variable is set to a false value', () => {
    vi.stubEnv('CLAUDECODE', 'False');

    loadMaybeWriteAgentRules()(config());

    expect(fs.existsSync(agentsMdPath())).toBe(false);
  });

  test('skips in production', () => {
    vi.stubEnv('CLAUDECODE', '1');
    vi.stubEnv('NODE_ENV', 'production');

    loadMaybeWriteAgentRules()(config());

    expect(fs.existsSync(agentsMdPath())).toBe(false);
  });

  test('skips in CI', () => {
    vi.stubEnv('CLAUDECODE', '1');
    vi.stubEnv('CI', 'true');

    loadMaybeWriteAgentRules()(config());

    expect(fs.existsSync(agentsMdPath())).toBe(false);
  });
});
