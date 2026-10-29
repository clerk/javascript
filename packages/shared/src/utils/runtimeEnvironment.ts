import { getEnvVariable } from '../getEnvVariable';

export const automatedEnvironmentVariables = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'BUILDKITE',
  'BITBUCKET_BUILD_NUMBER',
  'APPVEYOR',
  'CODEBUILD_BUILD_ID',
  'TF_BUILD',
  'TEAMCITY_VERSION',
  'JENKINS_URL',
  'HUDSON_URL',
  'BAMBOO_BUILDKEY',
  'CF_PAGES',
] as const;

export const agentEnvironmentVariables = [
  'AI_AGENT',
  'AGENT',
  'AGENTS',
  'ANTIGRAVITY_AGENT',
  'AUGMENT_AGENT',
  'CLAUDECODE',
  'CLAUDE_CODE',
  'CODEX_CI',
  'CODEX_SANDBOX',
  'CODEX_THREAD_ID',
  'COPILOT_ALLOW_ALL',
  'COPILOT_GITHUB_TOKEN',
  'COPILOT_MODEL',
  'CURSOR_AGENT',
  'CURSOR_CLI',
  'CURSOR_EXTENSION_HOST_ROLE',
  'CURSOR_TRACE_ID',
  'GEMINI_CLI',
  'GITHUB_COPILOT_AGENT',
  'GITHUB_COPILOT_CHAT',
  'OPENCODE',
  'OPENCODE_CLIENT',
  'REPL_ID',
] as const;

const isTruthyEnvValue = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value) {
    return false;
  }

  return !['0', 'false', 'off', 'no'].includes(value.toLowerCase());
};

export const isDevelopmentEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'development';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite

  return false;
};

export const isTestEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'test';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};

export const isProductionEnvironment = (): boolean => {
  try {
    return process.env.NODE_ENV === 'production';
    // eslint-disable-next-line no-empty
  } catch {}

  // TODO: add support for import.meta.env.DEV that is being used by vite
  return false;
};

export const isAutomatedEnvironment = (): boolean => {
  return automatedEnvironmentVariables.some(name => isTruthyEnvValue(getEnvVariable(name)));
};

export const isAgentEnvironment = (): boolean => {
  return agentEnvironmentVariables.some(name => {
    const value = getEnvVariable(name);
    return name === 'CURSOR_EXTENSION_HOST_ROLE' ? value === 'agent-exec' : isTruthyEnvValue(value);
  });
};

export const isClerkAgentRulesWriteAllowed = (): boolean => {
  const optOut = (getEnvVariable('CLERK_AGENTS_MD') || '').trim().toLowerCase();
  return (
    !['0', 'false', 'off', 'no'].includes(optOut) &&
    !isProductionEnvironment() &&
    !isTestEnvironment() &&
    !isAutomatedEnvironment() &&
    isAgentEnvironment()
  );
};
