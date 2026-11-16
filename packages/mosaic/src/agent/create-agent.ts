import { flushSync } from 'react-dom';

import { isLocalizableError } from '../localization';
import { SaveError, toLocalizableError } from '../utils/errors';
import type { Input, InputSchema, Shape } from './input';
import { inputSchema, parseInput } from './input';

export interface AgentAction {
  description: string;
  input: InputSchema;
  confirm?: string;
  prepare: (input: object) => () => unknown;
}

export interface AgentSurface {
  component: string;
  label?: string;
  state?: () => unknown;
  pending?: () => boolean;
  actions: Record<string, AgentAction | false | undefined>;
}

export interface AgentStep {
  ref: string;
  action: string;
  input?: object;
}

export interface AgentRequest {
  ref: string;
  component: string;
  label?: string;
  action: string;
  input: object;
  confirm?: string;
}

export type Allow = (step: AgentRequest, context: { signal: AbortSignal }) => boolean | Promise<boolean>;

export interface AgentSnapshot {
  ref: string;
  component: string;
  label?: string;
  state?: unknown;
  actions: { name: string; description: string; input: InputSchema; confirm?: string }[];
}

export interface AgentResult {
  ok: boolean;
  error?: { step?: number; message: string };
  done: { ref: string; action: string }[];
  state: Record<string, unknown>;
  appeared: AgentSnapshot[];
}

export interface Agent {
  add: (surface: () => AgentSurface | undefined) => () => void;
  snapshot: () => AgentSnapshot[];
  act: (input: { steps: AgentStep[] }, options?: { allow?: Allow; signal?: AbortSignal }) => Promise<AgentResult>;
}

export function action<S extends Shape>(definition: {
  description: string;
  input?: S;
  confirm?: string;
  run: (input: Input<S>) => unknown;
}): AgentAction {
  const shape = definition.input;
  return {
    description: definition.description,
    input: inputSchema(shape),
    confirm: definition.confirm,
    prepare: input => {
      const parsed = parseInput(shape, input);
      return () => definition.run(parsed);
    },
  };
}

interface Entry {
  ref?: string;
  get: () => AgentSurface | undefined;
}

export function createAgent(options: { allow?: Allow } = {}): Agent {
  const entries: Entry[] = [];

  const refFor = (entry: Entry, component: string) => {
    if (entry.ref) {
      return entry.ref;
    }
    const taken = new Set(entries.map(other => other.ref));
    let count = 1;
    while (taken.has(count === 1 ? component : `${component}-${count}`)) {
      count += 1;
    }
    entry.ref = count === 1 ? component : `${component}-${count}`;
    return entry.ref;
  };

  const live = () =>
    entries.flatMap(entry => {
      const surface = entry.get();
      return surface ? [{ ref: refFor(entry, surface.component), surface }] : [];
    });

  const actionsOf = (surface: AgentSurface) =>
    Object.entries(surface.actions).flatMap(([name, definition]) => (definition ? [{ name, definition }] : []));

  const describe = (ref: string, surface: AgentSurface): AgentSnapshot => ({
    ref,
    component: surface.component,
    label: surface.label,
    state: surface.state?.(),
    actions: actionsOf(surface).map(({ name, definition }) => ({
      name,
      description: definition.description,
      input: definition.input,
      confirm: definition.confirm,
    })),
  });

  const find = (step: AgentStep) => {
    const shown = live();
    const found = shown.find(({ ref }) => ref === step.ref);
    if (!found) {
      const refs = shown.map(({ ref }) => ref).join(', ');
      throw new Error(`nothing is called "${step.ref}". ${refs ? `There is: ${refs}` : 'There is nothing here'}`);
    }
    const actions = actionsOf(found.surface);
    const definition = actions.find(({ name }) => name === step.action)?.definition;
    if (!definition) {
      const names = actions.map(({ name }) => name).join(', ');
      throw new Error(`${found.ref} does not take "${step.action}". It takes: ${names || 'nothing'}`);
    }
    return { ...found, definition };
  };

  const runStep = async (step: AgentStep, extra: { allow?: Allow; signal: AbortSignal }) => {
    const { ref, surface, definition } = find(step);
    const input = step.input ?? {};
    const run = definition.prepare(input);
    const request: AgentRequest = {
      ref,
      component: surface.component,
      label: surface.label,
      action: step.action,
      input,
      confirm: definition.confirm,
    };
    const deciders = [options.allow, extra.allow].filter(decide => decide !== undefined);
    if (definition.confirm && deciders.length === 0) {
      throw new Error(`Needs a person: ${definition.confirm}`);
    }
    for (const decide of deciders) {
      if (!(await decide(request, { signal: extra.signal }))) {
        throw new Error(definition.confirm ? `Refused: ${definition.confirm}` : 'Refused');
      }
    }
    await flushSync(run);
    return ref;
  };

  return {
    add: get => {
      const entry: Entry = { get };
      entries.push(entry);
      return () => {
        const index = entries.indexOf(entry);
        if (index !== -1) {
          entries.splice(index, 1);
        }
      };
    },
    snapshot: () => live().map(({ ref, surface }) => describe(ref, surface)),
    act: async ({ steps }, extra = {}) => {
      const signal = extra.signal ?? new AbortController().signal;
      const shown = new Set(live().map(({ ref }) => ref));
      const done: AgentResult['done'] = [];
      let error: AgentResult['error'];
      for (const [index, step] of steps.entries()) {
        try {
          done.push({ ref: await runStep(step, { allow: extra.allow, signal }), action: step.action });
        } catch (thrown) {
          error = { step: index, message: messageOf(thrown) };
          break;
        }
      }
      await settle();
      await whilePending(() => live().some(({ surface }) => surface.pending?.() === true));
      const after = live();
      const touched = new Set(done.map(({ ref }) => ref));
      const state = Object.fromEntries(
        after.filter(({ ref }) => touched.has(ref)).map(({ ref, surface }) => [ref, surface.state?.()]),
      );
      const appeared = after.filter(({ ref }) => !shown.has(ref)).map(({ ref, surface }) => describe(ref, surface));
      return error ? { ok: false, error, done, state, appeared } : { ok: true, done, state, appeared };
    },
  };
}

function messageOf(error: unknown): string {
  return (savedMessage(error) ?? (error instanceof Error ? error.message : String(error))).replace(/\.$/, '');
}

function savedMessage(error: unknown): string | undefined {
  if (!(error instanceof SaveError)) {
    return undefined;
  }
  const description = toLocalizableError(error);
  return isLocalizableError(description) ? (description.message ?? description.code) : undefined;
}

function frame(): Promise<void> {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, 50);
    requestAnimationFrame(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function settle(): Promise<void> {
  await frame();
  await frame();
}

async function whilePending(pending: () => boolean): Promise<void> {
  if (!pending()) {
    return;
  }
  for (let waited = 0; pending() && waited < 15_000; waited += 50) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  await settle();
}
