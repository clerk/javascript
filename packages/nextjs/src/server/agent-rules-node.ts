import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isAgentEnvironment, isAutomatedEnvironment, isProductionEnvironment } from '@clerk/shared/utils';

import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

let didWrite = false;

export function writeAgentRulesOnce() {
  if (didWrite || isProductionEnvironment() || isAutomatedEnvironment() || !isAgentEnvironment()) {
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
