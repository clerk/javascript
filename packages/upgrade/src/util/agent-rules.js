import fs from 'node:fs';
import path from 'node:path';

import { isClerkAgentRulesSdk, writeClerkAgentRules as writeRules } from '@clerk/shared/agentRules';

import { findWorkspaceRoot, getInstalledClerkPackages, getWorkspacePackageDirs } from './detect-sdk.js';

export function detectClerkAgentRuleSdks(dir) {
  const workspaceRoot = findWorkspaceRoot(dir);
  const packageDirs = workspaceRoot ? [workspaceRoot, ...getWorkspacePackageDirs(workspaceRoot)] : [dir];
  const sdks = new Set();

  for (const packageDir of packageDirs) {
    for (const packageName of Object.keys(getInstalledClerkPackages(packageDir))) {
      const sdk = packageName.replace(/^@clerk\//, '');
      if (isClerkAgentRulesSdk(sdk)) {
        sdks.add(sdk);
      }
    }
  }

  return [...sdks].sort();
}

export function writeClerkAgentRules({ dir, dryRun = false, sdks = detectClerkAgentRuleSdks(dir) }) {
  return { ...writeRules({ cwd: dir, dryRun, force: true, fs, path, sdks }), sdks };
}
