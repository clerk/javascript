import { describe, expect, it } from 'vitest';

import type { AuthFlowFacts, AuthFlowOutcome } from '../auth-flow.types';
import { flowOutcome } from '../auth-flow.utils';

const task = { type: 'task', key: 'choose-organization' } as const;
const resource: AuthFlowOutcome = { type: 'resource' };
const facts: AuthFlowFacts = {
  session: { type: 'none' },
  entry: 'none',
  finish: 'idle',
  singleSession: false,
  isTaskReady: true,
};

describe('auth flow outcome', () => {
  it.each<[string, Partial<AuthFlowFacts>, AuthFlowOutcome]>([
    ['follows the resource while signed out', {}, resource],
    ['holds the screen while the session activates', { session: { type: 'activating' } }, { type: 'hold' }],
    ['holds the screen while the flow finishes', { finish: 'finishing' }, { type: 'hold' }],
    ['follows the resource again after the activation failed', { finish: 'failed' }, resource],
    ['shows a task the visitor arrived with', { session: task, entry: 'task', isTaskReady: false }, task],
    [
      'holds the screen until the task after the flow has loaded',
      { session: task, finish: 'finalized', isTaskReady: false },
      { type: 'hold' },
    ],
    ['shows the task after the flow once it has loaded', { session: task, finish: 'finalized' }, task],
    [
      'is done once the flow it finished is signed in',
      { session: { type: 'active' }, finish: 'finalized' },
      { type: 'done' },
    ],
    [
      'is done once a second account is signed in',
      { session: { type: 'active' }, entry: 'active', finish: 'finalized' },
      { type: 'done' },
    ],
    [
      'is done once the task the visitor arrived with is',
      { session: { type: 'active' }, entry: 'task' },
      { type: 'done' },
    ],
    [
      'leaves when the visitor arrived signed in, in single-session mode',
      { session: { type: 'active' }, entry: 'active', singleSession: true },
      { type: 'leave' },
    ],
    [
      'follows the resource to add an account, in multi-session mode',
      { session: { type: 'active' }, entry: 'active' },
      resource,
    ],
    [
      'keeps the form when another tab signs in mid-flow',
      { session: { type: 'active' }, entry: 'none', singleSession: true },
      resource,
    ],
  ])('%s', (_, changed, expected) => {
    expect(flowOutcome({ ...facts, ...changed })).toEqual(expected);
  });
});
