import { afterEach, describe, expect, it, vi } from 'vitest';

import { action, createAgent } from '../create-agent';
import { registerTools } from '../register-tools';

interface Registered {
  name: string;
  annotations?: object;
  execute: (input: object, context: { signal: AbortSignal }) => unknown;
}

function installModelContext(
  registerTool = (_tool: Registered, _options: { signal: AbortSignal }) => Promise.resolve(),
) {
  const tools = new Map<string, Registered>();
  const modelContext = {
    registerTool: vi.fn((tool: Registered, options: { signal: AbortSignal }) => {
      tools.set(tool.name, tool);
      options.signal.addEventListener('abort', () => tools.delete(tool.name));
      return registerTool(tool, options);
    }),
  };
  Object.defineProperty(document, 'modelContext', { value: modelContext, configurable: true });
  return tools;
}

function requiredTool(tools: Map<string, Registered>, name: string): Registered {
  const tool = tools.get(name);
  if (!tool) {
    throw new Error(`${name} is not registered`);
  }
  return tool;
}

afterEach(() => {
  Reflect.deleteProperty(document, 'modelContext');
  vi.unstubAllEnvs();
});

const signal = new AbortController().signal;

describe('registerTools', () => {
  it('hands the browser a snapshot and an act tool until unregistered', async () => {
    const tools = installModelContext();
    const run = vi.fn();
    const agent = createAgent();
    agent.add(() => ({ component: 'counter', actions: { add: action({ description: 'Adds one', run }) } }));

    const unregister = registerTools(agent, { allow: () => true });

    expect([...tools.keys()]).toEqual(['clerk_snapshot', 'clerk_act']);
    expect(requiredTool(tools, 'clerk_snapshot').annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    expect(requiredTool(tools, 'clerk_act').annotations).toEqual({
      consequentialHint: true,
      untrustedContentHint: true,
    });
    expect(await requiredTool(tools, 'clerk_snapshot').execute({}, { signal })).toEqual(agent.snapshot());

    await requiredTool(tools, 'clerk_act').execute({ steps: [{ ref: 'counter', action: 'add' }] }, { signal });
    expect(run).toHaveBeenCalledTimes(1);

    unregister();
    expect(tools.size).toBe(0);
  });

  it('asks allow before every step the browser agent runs', async () => {
    const tools = installModelContext();
    const run = vi.fn();
    const agent = createAgent();
    agent.add(() => ({ component: 'counter', actions: { add: action({ description: 'Adds one', run }) } }));
    registerTools(agent, { allow: step => step.action !== 'add' });

    await expect(
      requiredTool(tools, 'clerk_act').execute({ steps: [{ ref: 'counter', action: 'add' }] }, { signal }),
    ).resolves.toMatchObject({ ok: false, error: { step: 0, message: 'Refused' } });
    await expect(requiredTool(tools, 'clerk_act').execute({ steps: 'add' }, { signal })).resolves.toEqual({
      ok: false,
      error: { message: 'steps must be a list of { ref, action, input? }' },
      done: [],
      state: {},
      appeared: [],
    });
    expect(run).not.toHaveBeenCalled();
  });

  it('logs a failed registration with its error only in development', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const taken = new DOMException('Taken', 'InvalidStateError');
    installModelContext(() => Promise.reject(taken));

    vi.stubEnv('NODE_ENV', 'development');
    registerTools(createAgent(), { allow: () => true });
    await Promise.resolve();
    expect(error).toHaveBeenCalledWith('[Clerk] Could not register the WebMCP tool clerk_snapshot', taken);
    expect(error).toHaveBeenCalledWith('[Clerk] Could not register the WebMCP tool clerk_act', taken);

    error.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    registerTools(createAgent(), { allow: () => true });
    await Promise.resolve();
    expect(error).not.toHaveBeenCalled();
  });

  it('stays quiet when the browser refuses or the page unregisters first', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    installModelContext(() => Promise.reject(new DOMException('Blocked', 'NotAllowedError')));
    registerTools(createAgent(), { allow: () => true })();
    installModelContext(() => Promise.reject(new DOMException('Aborted', 'AbortError')));
    registerTools(createAgent(), { allow: () => true })();
    await Promise.resolve();

    expect(error).not.toHaveBeenCalled();
  });

  it('does nothing in a browser without WebMCP', () => {
    expect(() => registerTools(createAgent(), { allow: () => true })()).not.toThrow();
  });
});
