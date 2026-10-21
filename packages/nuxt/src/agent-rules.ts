import * as fs from 'node:fs';
import * as path from 'node:path';

import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

let didWrite = false;

export function writeAgentRulesOnce(rootDir: string) {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  try {
    writeClerkAgentRules({ cwd: rootDir, fs, path, sdks: ['nuxt'] });
  } catch {
    // Writing agent hints must never break a dev server.
  }
}
