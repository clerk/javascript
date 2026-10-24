import {
  type ClerkAgentRulesSdk,
  type FileSystemAdapter,
  logClerkAgentRulesResult,
  type PathAdapter,
  writeClerkAgentRules,
} from './agentRules';
import { isClerkAgentRulesWriteAllowed } from './utils';

type NodeProcess = {
  cwd: () => string;
  getBuiltinModule?: (id: string) => unknown;
};

export function createClerkAgentRulesWriter(sdk: ClerkAgentRulesSdk) {
  let didWrite = false;

  return (cwd?: string) => {
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
      logClerkAgentRulesResult(writeClerkAgentRules({ cwd: cwd ?? nodeProcess.cwd(), fs, path, sdks: [sdk] }));
    } catch {
      return;
    }
  };
}
