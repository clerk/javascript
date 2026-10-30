import fs from 'node:fs';
import path from 'node:path';

import { isClerkAgentRulesSdk, writeClerkAgentRules as writeRules } from '@clerk/shared/agentRules';

import { findWorkspaceRoot, getInstalledClerkPackages, getWorkspacePackageDirs } from './detect-sdk.js';

function getAgentRuleSdks(packageDir) {
  return Object.keys(getInstalledClerkPackages(packageDir))
    .map(packageName => packageName.replace(/^@clerk\//, ''))
    .filter(isClerkAgentRulesSdk);
}

function getPackageDirs(dir) {
  const workspaceRoot = findWorkspaceRoot(dir);
  return workspaceRoot ? [workspaceRoot, ...getWorkspacePackageDirs(workspaceRoot)] : [dir];
}

export function detectClerkAgentRuleSdks(dir) {
  return [...new Set(getPackageDirs(dir).flatMap(getAgentRuleSdks))].sort();
}

export function writeClerkAgentRules({ dir, dryRun = false, sdks = detectClerkAgentRuleSdks(dir) }) {
  const packageDirs = getPackageDirs(dir);
  const writes = packageDirs
    .map(packageDir => ({
      packageDir,
      sdks: packageDirs.length === 1 ? sdks : getAgentRuleSdks(packageDir).filter(sdk => sdks.includes(sdk)),
    }))
    .filter(write => write.sdks.length > 0);

  const results = writes.map(write =>
    writeRules({ cwd: write.packageDir, dryRun, force: true, fs, path, sdks: write.sdks }),
  );
  const statuses = results.map(result => result.agentsMd);
  const agentsMd = statuses.includes('created')
    ? 'created'
    : statuses.includes('updated')
      ? 'updated'
      : statuses.length > 0 && statuses.every(status => status === 'disabled')
        ? 'disabled'
        : 'unchanged';

  return { targetDir: results[0]?.targetDir ?? path.resolve(dir), agentsMd, sdks };
}
