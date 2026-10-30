import { describe, expect, it, vi } from 'vitest';

import { writeAgentRulesOnce } from '../agentRules';

const { createdFor, writeAgentRules } = vi.hoisted(() => ({ createdFor: [] as string[], writeAgentRules: vi.fn() }));

vi.mock('@clerk/shared/agentRulesWriter', () => ({
  createClerkAgentRulesWriter: (sdk: string) => {
    createdFor.push(sdk);
    return writeAgentRules;
  },
}));

describe('writeAgentRulesOnce', () => {
  it('is the shared writer for the tanstack-react-start SDK', () => {
    expect(createdFor).toEqual(['tanstack-react-start']);
    expect(writeAgentRulesOnce).toBe(writeAgentRules);
  });
});
