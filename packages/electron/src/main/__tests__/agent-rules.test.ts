import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeAgentRulesOnce } from '../agent-rules';

const { createdFor, writeAgentRules } = vi.hoisted(() => ({ createdFor: [] as string[], writeAgentRules: vi.fn() }));

vi.mock('@clerk/shared/agentRulesWriter', () => ({
  createClerkAgentRulesWriter: (sdk: string) => {
    createdFor.push(sdk);
    return writeAgentRules;
  },
}));

const electronApp = vi.hoisted(() => ({ isPackaged: false, getAppPath: () => '/projects/my-app' }));

vi.mock('electron', () => ({ app: electronApp }));

describe('writeAgentRulesOnce', () => {
  beforeEach(() => {
    writeAgentRules.mockReset();
    electronApp.isPackaged = false;
  });

  it('creates a writer for the electron SDK', () => {
    expect(createdFor).toEqual(['electron']);
  });

  it('writes to the app path when the app is not packaged', () => {
    writeAgentRulesOnce();

    expect(writeAgentRules).toHaveBeenCalledWith('/projects/my-app');
  });

  it('skips packaged apps', () => {
    electronApp.isPackaged = true;

    writeAgentRulesOnce();

    expect(writeAgentRules).not.toHaveBeenCalled();
  });

  it('does not throw when writing fails', () => {
    writeAgentRules.mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(() => writeAgentRulesOnce()).not.toThrow();
  });
});
