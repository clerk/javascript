import { describe, expect, it, vi } from 'vitest';

import { clerkMiddleware } from '../clerkMiddleware';

const { createdFor, writeAgentRules } = vi.hoisted(() => ({ createdFor: [] as string[], writeAgentRules: vi.fn() }));

vi.mock('@clerk/shared/agentRulesWriter', () => ({
  createClerkAgentRulesWriter: (sdk: string) => {
    createdFor.push(sdk);
    return writeAgentRules;
  },
}));

describe('Clerk agent rules', () => {
  it('creates a writer for the hono SDK', () => {
    expect(createdFor).toEqual(['hono']);
  });

  it('writes the agent rules when the app sets up Clerk', () => {
    writeAgentRules.mockClear();

    clerkMiddleware();

    expect(writeAgentRules).toHaveBeenCalledTimes(1);
  });
});
