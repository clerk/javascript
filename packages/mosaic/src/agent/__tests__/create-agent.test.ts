import { describe, expect, it, vi } from 'vitest';

import type { AgentStep } from '../create-agent';
import { action, createAgent } from '../create-agent';
import { optional, string } from '../input';

const counter = (run = vi.fn()) => ({
  component: 'counter',
  label: 'Clicks',
  state: () => ({ count: 1 }),
  actions: {
    add: action({
      description: 'Adds to the count',
      input: { by: string('How much'), note: optional(string()) },
      run,
    }),
    reset: action({ description: 'Resets the count', confirm: 'Resets the count to zero', run }),
    hidden: undefined,
  },
});

describe('createAgent', () => {
  it('lists each surface with its state and the actions it takes now', () => {
    const agent = createAgent();
    agent.add(() => counter());

    expect(agent.snapshot()).toEqual([
      {
        ref: 'counter',
        component: 'counter',
        label: 'Clicks',
        state: { count: 1 },
        actions: [
          {
            name: 'add',
            description: 'Adds to the count',
            input: {
              type: 'object',
              properties: { by: { type: 'string', description: 'How much' }, note: { type: 'string' } },
              required: ['by'],
            },
          },
          {
            name: 'reset',
            description: 'Resets the count',
            input: { type: 'object', properties: {}, required: [] },
            confirm: 'Resets the count to zero',
          },
        ],
      },
    ]);
  });

  it('gives a second surface of the same component its own ref, and frees it on remove', () => {
    const agent = createAgent();
    const remove = agent.add(() => counter());
    agent.add(() => counter());

    expect(agent.snapshot().map(surface => surface.ref)).toEqual(['counter', 'counter-2']);

    remove();
    agent.add(() => counter());
    expect(agent.snapshot().map(surface => surface.ref)).toEqual(['counter-2', 'counter']);
  });

  it('leaves out a surface that is not ready', () => {
    const agent = createAgent();
    agent.add(() => undefined);

    expect(agent.snapshot()).toEqual([]);
  });

  it('runs steps in order with their parsed input', async () => {
    const run = vi.fn();
    const agent = createAgent();
    agent.add(() => counter(run));

    await agent.act({
      steps: [
        { ref: 'counter', action: 'add', input: { by: '2' } },
        { ref: 'counter', action: 'add', input: { by: '3', note: 'x' } },
      ],
    });

    expect(run.mock.calls).toEqual([[{ by: '2', note: undefined }], [{ by: '3', note: 'x' }]]);
  });

  it('returns the state of each surface it touched once the steps settle', async () => {
    let count = 1;
    const agent = createAgent();
    agent.add(() => ({
      component: 'counter',
      state: () => ({ count }),
      actions: { add: action({ description: 'Adds one', run: () => void (count += 1) }) },
    }));

    await expect(agent.act({ steps: [{ ref: 'counter', action: 'add' }] })).resolves.toEqual({
      ok: true,
      done: [{ ref: 'counter', action: 'add' }],
      state: { counter: { count: 2 } },
      appeared: [],
    });
  });

  it('lists the surfaces that appeared while the steps ran', async () => {
    const agent = createAgent();
    const dialog = () => ({ component: 'dialog', state: () => ({ open: true }), actions: {} });
    agent.add(() => ({
      component: 'menu',
      actions: { open: action({ description: 'Opens the dialog', run: () => void agent.add(dialog) }) },
    }));

    const { appeared } = await agent.act({ steps: [{ ref: 'menu', action: 'open' }] });

    expect(appeared).toEqual([{ ref: 'dialog', component: 'dialog', state: { open: true }, actions: [] }]);
  });

  it('stops at the first failing step and says what is there', async () => {
    const run = vi.fn();
    const agent = createAgent();
    agent.add(() => counter(run));
    const errorOf = async (steps: AgentStep[]) => (await agent.act({ steps })).error;

    expect(
      await errorOf([
        { ref: 'menu', action: 'add' },
        { ref: 'counter', action: 'add', input: { by: '1' } },
      ]),
    ).toEqual({
      step: 0,
      message: 'nothing is called "menu". There is: counter',
    });
    expect(await errorOf([{ ref: 'counter', action: 'hidden' }])).toEqual({
      step: 0,
      message: 'counter does not take "hidden". It takes: add, reset',
    });
    expect(await errorOf([{ ref: 'counter', action: 'add', input: { by: 2 } }])).toEqual({
      step: 0,
      message: 'by must be a string',
    });
    expect(await errorOf([{ ref: 'counter', action: 'add' }])).toEqual({ step: 0, message: 'by is required' });
    expect(run).not.toHaveBeenCalled();
  });

  it('waits while a surface is pending, so what its step opens has appeared', async () => {
    const agent = createAgent();
    let loading = false;
    const dialog = () => ({ component: 'dialog', actions: {} });
    agent.add(() => ({
      component: 'menu',
      pending: () => loading,
      actions: {
        open: action({
          description: 'Opens the dialog once its code loads',
          run: () => {
            loading = true;
            setTimeout(() => {
              loading = false;
              agent.add(dialog);
            }, 200);
          },
        }),
      },
    }));

    const { appeared } = await agent.act({ steps: [{ ref: 'menu', action: 'open' }] });

    expect(appeared.map(({ ref }) => ref)).toEqual(['dialog']);
  });

  it('reports a failing action with the steps that ran before it', async () => {
    const agent = createAgent();
    agent.add(() => ({
      component: 'counter',
      state: () => ({ count: 1 }),
      actions: {
        ok: action({ description: 'Works', run: () => undefined }),
        fail: action({
          description: 'Fails',
          run: () => Promise.reject(new Error('Not allowed in this organization')),
        }),
      },
    }));

    await expect(
      agent.act({
        steps: [
          { ref: 'counter', action: 'ok' },
          { ref: 'counter', action: 'fail' },
        ],
      }),
    ).resolves.toEqual({
      ok: false,
      error: { step: 1, message: 'Not allowed in this organization' },
      done: [{ ref: 'counter', action: 'ok' }],
      state: { counter: { count: 1 } },
      appeared: [],
    });
  });

  it('leaves a confirm step to a person when nothing allows it', async () => {
    const run = vi.fn();
    const agent = createAgent();
    agent.add(() => counter(run));

    expect((await agent.act({ steps: [{ ref: 'counter', action: 'reset' }] })).error).toEqual({
      step: 0,
      message: 'Needs a person: Resets the count to zero',
    });
    expect(run).not.toHaveBeenCalled();
  });

  it('asks the agent allow, then the caller allow, about every step', async () => {
    const run = vi.fn();
    const asked: string[] = [];
    const agent = createAgent({ allow: step => (asked.push(`agent ${step.action}`), true) });
    agent.add(() => counter(run));

    await agent.act(
      { steps: [{ ref: 'counter', action: 'reset' }] },
      { allow: step => (asked.push(`caller ${step.action} ${step.confirm ?? ''}`), true) },
    );
    expect(asked).toEqual(['agent reset', 'caller reset Resets the count to zero']);
    expect(run).toHaveBeenCalledTimes(1);

    const refused = await agent.act(
      { steps: [{ ref: 'counter', action: 'reset' }] },
      { allow: () => Promise.resolve(false) },
    );
    expect(refused.error).toEqual({ step: 0, message: 'Refused: Resets the count to zero' });
    expect(run).toHaveBeenCalledTimes(1);
  });
});
