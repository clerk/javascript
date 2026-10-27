import { logClerkAgentRulesError, logClerkAgentRulesResult, writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

let didWrite = false;

export function writeAgentRulesOnce() {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  try {
    logClerkAgentRulesResult(
      writeClerkAgentRules({
        cwd: nodeCwdOrThrow()(),
        fs: nodeFsOrThrow(),
        path: nodePathOrThrow(),
        sdks: ['nextjs'],
      }),
    );
  } catch (error) {
    logClerkAgentRulesError(error);
  }
}
