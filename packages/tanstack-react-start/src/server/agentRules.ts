import type { FileSystemAdapter, PathAdapter } from '@clerk/shared/agentRules';
import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

type NodeProcess = {
  cwd: () => string;
  getBuiltinModule?: (id: string) => unknown;
};

let didWrite = false;

export function writeAgentRulesOnce() {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  const nodeProcess = (globalThis as { process?: NodeProcess }).process;
  const fs = nodeProcess?.getBuiltinModule?.('node:fs') as FileSystemAdapter | undefined;
  const path = nodeProcess?.getBuiltinModule?.('node:path') as PathAdapter | undefined;
  if (!nodeProcess || !fs || !path) {
    return;
  }

  try {
    writeClerkAgentRules({ cwd: nodeProcess.cwd(), fs, path, sdks: ['tanstack-react-start'] });
  } catch {
    return;
  }
}
