import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

let didWrite = false;

export function writeAgentRulesOnce() {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  try {
    writeClerkAgentRules({
      cwd: nodeCwdOrThrow()(),
      fs: nodeFsOrThrow(),
      path: nodePathOrThrow(),
      sdks: ['nextjs'],
    });
  } catch {
    // Writing agent hints must never break a dev server.
  }
}
