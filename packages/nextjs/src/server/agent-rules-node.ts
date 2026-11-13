import { logClerkAgentRulesError, logClerkAgentRulesResult, writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

let didWrite = false;

export function writeAgentRulesOnce() {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  let node;
  try {
    node = { cwd: nodeCwdOrThrow()(), fs: nodeFsOrThrow(), path: nodePathOrThrow() };
  } catch {
    return;
  }

  try {
    logClerkAgentRulesResult(writeClerkAgentRules({ ...node, sdks: ['nextjs'] }));
  } catch (error) {
    logClerkAgentRulesError(error);
  }
}
