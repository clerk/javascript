import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { clerkPlugin } from '../clerkPlugin';

const { createdFor, writeAgentRules } = vi.hoisted(() => ({ createdFor: [] as string[], writeAgentRules: vi.fn() }));

vi.mock('@clerk/shared/agentRulesWriter', () => ({
  createClerkAgentRulesWriter: (sdk: string) => {
    createdFor.push(sdk);
    return writeAgentRules;
  },
}));

describe('Clerk agent rules', () => {
  it('creates a writer for the fastify SDK', () => {
    expect(createdFor).toEqual(['fastify']);
  });

  it('writes the agent rules when the plugin is registered', async () => {
    writeAgentRules.mockClear();
    const fastify = Fastify();

    await fastify.register(clerkPlugin, { publishableKey: 'pk_test_xxx', secretKey: 'sk_test_xxx' });
    await fastify.ready();

    expect(writeAgentRules).toHaveBeenCalledTimes(1);
    await fastify.close();
  });
});
