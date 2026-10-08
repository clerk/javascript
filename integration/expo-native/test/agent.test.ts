import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { inspect } from 'node:util';
import { agentCheck, agentEnvironment, takeAgent } from '../src/core/agent.ts';
import { BACKUP_AGENT_MODEL, DEFAULT_AGENT_MODEL, UnusableAgentKey, readAgent } from '../specs/support/agent.ts';
import { composeE2EConfig } from '../specs/support/config.ts';
import { invokeE2E, planE2E } from '../src/core/e2e.ts';
import { sealEvidence } from '../src/core/evidence.ts';
import { withoutClerkKeys } from '../src/core/keys.ts';
import { redact, usedSecretValues } from '../specs/support/secret.ts';
import type { EvidencePath, EvidenceRecord } from '../src/core/types.ts';
import { IOS_APP, SAMPLE_INPUTS } from '../testing/sample-inputs.ts';

const GATEWAY_KEY = `gw_${'k'.repeat(20)}UnitTestOnly${'z'.repeat(20)}`;
const TARGET = SAMPLE_INPUTS.target;

function keyFile(mode: number, text = `${GATEWAY_KEY}\n`): string {
  const file = join(mkdtempSync(join(tmpdir(), 'verify-agent-key-')), 'ai-gateway-key');
  writeFileSync(file, text, { mode });
  chmodSync(file, mode);
  return file;
}

function modelOf(config: ReturnType<typeof composeE2EConfig>): { readonly provider: string; readonly modelId: string } {
  return config.agents?.default?.model as unknown as { readonly provider: string; readonly modelId: string };
}

function fakeE2E(): string {
  const packageDir = mkdtempSync(join(tmpdir(), 'verify-agent-'));
  const bin = join(packageDir, 'node_modules', '.bin');
  mkdirSync(bin, { recursive: true });
  const script = [
    '#!/usr/bin/env node',
    "const seen = (name) => process.env[name] ?? 'unset';",
    "console.log(`key=${seen('AI_GATEWAY_API_KEY')}`);",
    "console.log(`file=${seen('AI_GATEWAY_API_KEY_FILE')}`);",
    "console.log(`platform=${seen('CLERK_PLATFORM_API_KEY')}`);",
    "console.log(`secret=${seen('CLERK_SECRET_KEY')}`);",
    "console.log(`app=${seen('CLERK_E2E_APP_PATH')}`);",
    "console.log(`device=${seen('CLERK_E2E_DEVICE')}`);",
    "console.log(`argv=${process.argv.slice(2).join(' ')}`);",
  ].join('\n');
  writeFileSync(join(bin, 'e2e'), `${script}\n`, { mode: 0o755 });
  return packageDir;
}

async function invoke(agent: Parameters<typeof invokeE2E>[4]): Promise<{ readonly lines: readonly string[]; readonly log: string }> {
  const packageDir = fakeE2E();
  const log = join(packageDir, 'e2e.log') as EvidencePath;
  const lines: string[] = [];
  const result = await invokeE2E({ args: ['run', 'specs/explored/probe.e2e.ts'], env: { CLERK_E2E_DEVICE: 'nowhere' } }, log, packageDir, (line) => lines.push(line), agent);
  assert.equal(result.exitCode, 0);
  return { lines, log: readFileSync(log, 'utf8') };
}

describe('no agent without a gateway key', () => {
  it('composes a config with no agent', () => {
    const config = composeE2EConfig(IOS_APP, TARGET, {});
    assert.deepEqual(Object.keys(config).sort(), ['assertionTimeout', 'targets', 'tests', 'timeout', 'trace', 'workers']);
    assert.equal(config.agents, undefined);
    assert.equal(composeE2EConfig(IOS_APP, TARGET, { AI_GATEWAY_API_KEY: '  ' }).agents, undefined, 'a blank key is no key');
  });

  it('gives the e2e process no gateway variable, also when the caller has one in its own environment', async () => {
    const before = { key: process.env.AI_GATEWAY_API_KEY, file: process.env.AI_GATEWAY_API_KEY_FILE };
    process.env.AI_GATEWAY_API_KEY = GATEWAY_KEY;
    process.env.AI_GATEWAY_API_KEY_FILE = '/home/x/ai-gateway-key';
    try {
      const { lines } = await invoke(null);
      assert.deepEqual(lines.slice(0, 2), ['key=unset', 'file=unset']);
    } finally {
      for (const [name, value] of [['AI_GATEWAY_API_KEY', before.key], ['AI_GATEWAY_API_KEY_FILE', before.file]] as const) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it('needs no ai package, so a worktree that has not installed it still runs every spec without an agent step', () => {
    const script = [
      "import { registerHooks } from 'node:module';",
      "registerHooks({ resolve: (specifier, context, next) => { if (specifier === 'ai') throw new Error('ai is not installed'); return next(specifier, context); } });",
      `const { composeE2EConfig } = await import(${JSON.stringify(fileURLToPath(new URL('../specs/support/config.ts', import.meta.url)))});`,
      `const target = ${JSON.stringify(TARGET)};`,
      "const app = { platforms: ['ios'], id: () => 'com.clerk.sample', entry: () => ({ kind: 'binary' }) };",
      "console.log(Object.keys(composeE2EConfig(app, target, {})).sort().join(','));",
      "try { composeE2EConfig(app, target, { AI_GATEWAY_API_KEY: 'x'.repeat(24) }); console.log('composed an agent'); } catch (error) { console.log(error.message); }",
    ].join('\n');
    const printed = execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }).trim().split('\n');
    assert.deepEqual(printed, ['assertionTimeout,targets,tests,timeout,trace,workers', 'ai is not installed']);
  });

  it('tells doctor that no agent is configured, as a passing check', () => {
    assert.equal(takeAgent({})(), null);
    assert.deepEqual(agentCheck(takeAgent({})), {
      id: 'agent',
      ok: true,
      detail: 'none: AI_GATEWAY_API_KEY and AI_GATEWAY_API_KEY_FILE are not set, so agent.act and agent.assert have no model',
    });
  });
});

describe('the agent with a gateway key', () => {
  it('is the default model on the Vercel AI Gateway, with the replay cache off', () => {
    assert.equal(DEFAULT_AGENT_MODEL, 'anthropic/claude-haiku-5.5');
    const config = composeE2EConfig(IOS_APP, TARGET, { AI_GATEWAY_API_KEY: GATEWAY_KEY });
    assert.deepEqual(Object.keys(config.agents ?? {}), ['default']);
    assert.deepEqual({ provider: modelOf(config).provider, modelId: modelOf(config).modelId }, { provider: 'gateway', modelId: 'anthropic/claude-haiku-5.5' });
    assert.equal(config.cache, 'off', 'every agent step is judged by the model on the screen of this run');
  });

  it('names one backup model that the gateway tries when the default model fails', () => {
    assert.equal(BACKUP_AGENT_MODEL, 'openai/gpt-6-luna-fast');
    const config = composeE2EConfig(IOS_APP, TARGET, { AI_GATEWAY_API_KEY: GATEWAY_KEY });
    assert.deepEqual(config.agents?.default?.providerOptions, { gateway: { models: ['openai/gpt-6-luna-fast'] } });
    assert.equal(readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY })?.backup, 'openai/gpt-6-luna-fast');
  });

  it('reads the key from a file that only the user can read', () => {
    const file = keyFile(0o600);
    assert.equal(modelOf(composeE2EConfig(IOS_APP, TARGET, { AI_GATEWAY_API_KEY_FILE: file })).modelId, 'anthropic/claude-haiku-5.5');
    assert.equal(readAgent({ AI_GATEWAY_API_KEY_FILE: file })?.credential.variable, 'AI_GATEWAY_API_KEY_FILE');
    assert.equal(readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY, AI_GATEWAY_API_KEY_FILE: file })?.credential.variable, 'AI_GATEWAY_API_KEY', 'the inline key wins, as it does for the Platform API key');
  });

  it('hands e2e the absolute path of a key file named relative to the caller, because e2e runs in the package directory', () => {
    const file = keyFile(0o600);
    const named = relative(process.cwd(), file);
    assert.equal(isAbsolute(named), false);
    assert.deepEqual(agentEnvironment(readAgent({ AI_GATEWAY_API_KEY_FILE: named })), { AI_GATEWAY_API_KEY_FILE: file });
  });

  it('refuses a key file that others can read, a missing one, and an empty one', () => {
    const open = keyFile(0o644);
    assert.throws(() => readAgent({ AI_GATEWAY_API_KEY_FILE: open }), (error: UnusableAgentKey) => error instanceof UnusableAgentKey && error.fix === `chmod 600 ${open}`);
    assert.throws(() => readAgent({ AI_GATEWAY_API_KEY_FILE: '/nowhere/ai-gateway-key' }), (error: UnusableAgentKey) => error instanceof UnusableAgentKey && /does not exist/.test(error.what));
    const empty = keyFile(0o600, '\n');
    assert.throws(() => readAgent({ AI_GATEWAY_API_KEY_FILE: empty }), (error: UnusableAgentKey) => error instanceof UnusableAgentKey && /holds no key/.test(error.what));
    const directory = mkdtempSync(join(tmpdir(), 'verify-agent-key-dir-'));
    chmodSync(directory, 0o700);
    assert.throws(() => readAgent({ AI_GATEWAY_API_KEY_FILE: directory }), (error: UnusableAgentKey) => error instanceof UnusableAgentKey && /cannot be read \(EISDIR\)/.test(error.what));
    assert.equal(agentCheck(takeAgent({ AI_GATEWAY_API_KEY_FILE: directory })).ok, false, 'doctor reports it and does not crash');
    const check = agentCheck(takeAgent({ AI_GATEWAY_API_KEY_FILE: open }));
    assert.deepEqual({ id: check.id, ok: check.ok, fix: check.fix }, { id: 'agent', ok: false, fix: `chmod 600 ${open}` });
  });

  it('tells doctor the model and where the key came from', () => {
    assert.equal(agentCheck(takeAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY })).detail, 'anthropic/claude-haiku-5.5, with openai/gpt-6-luna-fast as its backup, through the Vercel AI Gateway; key from AI_GATEWAY_API_KEY');
    const file = keyFile(0o600);
    assert.equal(agentCheck(takeAgent({ AI_GATEWAY_API_KEY_FILE: file })).detail, 'anthropic/claude-haiku-5.5, with openai/gpt-6-luna-fast as its backup, through the Vercel AI Gateway; key from AI_GATEWAY_API_KEY_FILE');
  });
});

describe('the gateway key stays out of what a run writes', () => {
  it('leaves the environment that every other child process inherits', () => {
    const file = keyFile(0o600);
    const env: NodeJS.ProcessEnv = { AI_GATEWAY_API_KEY: GATEWAY_KEY, AI_GATEWAY_API_KEY_FILE: file, HOME: '/home/x' };
    const agent = takeAgent(env);
    assert.deepEqual(env, { HOME: '/home/x' });
    assert.equal(agent()?.model, DEFAULT_AGENT_MODEL, 'the agent was read before the variables were removed');
    assert.deepEqual(withoutClerkKeys({ AI_GATEWAY_API_KEY: GATEWAY_KEY, AI_GATEWAY_API_KEY_FILE: file, HOME: '/home/x' }), { HOME: '/home/x' });
  });

  it('prints as a placeholder and is known to the log redaction and the evidence scan', () => {
    const agent = readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY });
    assert.ok(agent !== null);
    for (const printed of [String(agent.credential.key), JSON.stringify(agent), inspect(agent, { depth: 8 }), JSON.stringify(agentCheck(() => agent))]) {
      assert.equal(printed.includes(GATEWAY_KEY), false, printed);
    }
    assert.equal(redact(`Authorization: Bearer ${GATEWAY_KEY}`), 'Authorization: Bearer <redacted>');
    assert.ok(usedSecretValues().includes(GATEWAY_KEY), 'the evidence scan looks for it');

    const file = keyFile(0o600, `  ${GATEWAY_KEY}-from-file\n`);
    takeAgent({ AI_GATEWAY_API_KEY_FILE: file })();
    assert.ok(usedSecretValues().includes(`${GATEWAY_KEY}-from-file`), 'a key from a file is known once it is read');
  });

  it('is not in the composed config where a report or a log could print it', () => {
    const config = composeE2EConfig(IOS_APP, TARGET, { AI_GATEWAY_API_KEY: GATEWAY_KEY });
    assert.equal(JSON.stringify(config).includes(GATEWAY_KEY), false);
    assert.equal(inspect(config, { depth: 10, showHidden: true }).includes(GATEWAY_KEY), false);
  });

  it('reaches the e2e process through its environment only, and the log of that process is redacted', async () => {
    const inline = readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY });
    const plan = planE2E(
      SAMPLE_INPUTS,
      [{ kind: 'explored', path: 'specs/explored/probe.e2e.ts', feature: null }],
      { verb: 'run', selection: { selectors: ['specs/explored/probe.e2e.ts'] }, video: false, retries: 0, githubReport: false, waitSeconds: 0 },
      '/package',
      '/package/.verify/runs/r20261007-120000-abcd/e2e' as EvidencePath,
    );
    assert.equal(JSON.stringify(plan).includes('GATEWAY'), false, 'the planned command line and its environment name no gateway variable');

    const handed = await invoke(inline);
    assert.deepEqual(handed.lines, ['key=<redacted>', 'file=unset', 'platform=unset', 'secret=unset', 'app=unset', 'device=nowhere', 'argv=run specs/explored/probe.e2e.ts']);
    assert.equal(handed.log.includes(GATEWAY_KEY), false);
    assert.match(handed.log, /^key=<redacted>$/m);

    const file = keyFile(0o600);
    const fromFile = readAgent({ AI_GATEWAY_API_KEY_FILE: file });
    assert.deepEqual(agentEnvironment(fromFile), { AI_GATEWAY_API_KEY_FILE: file }, 'a key in a file is handed over as the path, so no environment holds its value');
    assert.deepEqual((await invoke(fromFile)).lines.slice(0, 2), ['key=unset', `file=${file}`]);
  });

  it('taints a run whose files hold it', () => {
    readAgent({ AI_GATEWAY_API_KEY: GATEWAY_KEY });
    const dir = mkdtempSync(join(tmpdir(), 'verify-agent-run-')) as EvidencePath;
    writeFileSync(join(dir, 'e2e.log'), `model call failed: 401 for key ${GATEWAY_KEY}\n`);
    writeFileSync(join(dir, 'app.log'), 'nothing here\n');
    const sealed = sealEvidence(dir, { run: 'r20261007-120000-abcd' } as unknown as Omit<EvidenceRecord, 'sealed' | 'tainted'>);
    assert.deepEqual(sealed.tainted, [join(dir, 'e2e.log')]);
  });
});

describe('the environment the CLI gives the e2e process', () => {
  it("holds no secret key of the instance and no setting from the caller's shell, only the settings the CLI names", async () => {
    const exported = { CLERK_SECRET_KEY: 'sk_test_exportedByTheCaller', CLERK_E2E_APP_PATH: '/somewhere/else/E2EHost.app', CLERK_E2E_DEVICE: 'a-device-the-caller-exported' };
    const before = Object.fromEntries(Object.keys(exported).map((name) => [name, process.env[name]]));
    Object.assign(process.env, exported);
    try {
      const { lines } = await invoke(null);
      assert.deepEqual(lines.slice(3, 6), ['secret=unset', 'app=unset', 'device=nowhere']);
    } finally {
      for (const [name, value] of Object.entries(before)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });
});
