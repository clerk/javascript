import * as fs from 'node:fs';
import * as path from 'node:path';

import { logClerkAgentRulesError, logClerkAgentRulesResult, writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isClerkAgentRulesWriteAllowed } from '@clerk/shared/utils';

let didWrite = false;

export function writeAgentRulesOnce(rootDir: string) {
  if (didWrite || !isClerkAgentRulesWriteAllowed()) {
    return;
  }

  didWrite = true;

  try {
    logClerkAgentRulesResult(writeClerkAgentRules({ cwd: rootDir, fs, path, sdks: ['nuxt'] }));
  } catch (error) {
    logClerkAgentRulesError(error);
  }
}
