import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { logClerkAgentRulesResult, writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

let didWrite = false;

export function writeAgentRulesOnce(root: URL) {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  try {
    logClerkAgentRulesResult(writeClerkAgentRules({ cwd: fileURLToPath(root), fs, path, sdks: ['astro'] }));
  } catch {
    // Writing agent hints must never break a dev server.
  }
}
