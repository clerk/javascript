import { logClerkAgentRulesError } from '@clerk/shared/agentRules';
import { createClerkAgentRulesWriter } from '@clerk/shared/agentRulesWriter';
import { app } from 'electron';

const writeAgentRules = createClerkAgentRulesWriter('electron');

export function writeAgentRulesOnce() {
  if (app.isPackaged) {
    return;
  }

  try {
    writeAgentRules(app.getAppPath());
  } catch (error) {
    logClerkAgentRulesError(error);
  }
}
