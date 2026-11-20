import {
  type ClerkAgentRulesSdk,
  logClerkAgentRulesError,
  logClerkAgentRulesResult,
  writeClerkAgentRules,
} from './agentRules';
import { isClerkAgentRulesWriteAllowed } from './utils';

type ViteResolvedConfig = {
  command: 'build' | 'serve';
  root: string;
};

export function clerkAgentRulesVitePlugin(sdk: Extract<ClerkAgentRulesSdk, 'chrome-extension' | 'react' | 'vue'>) {
  let didWrite = false;

  return {
    name: `clerk-agent-rules-${sdk}`,
    apply: 'serve' as const,
    async configResolved(config: ViteResolvedConfig) {
      if (didWrite || config.command !== 'serve' || !isClerkAgentRulesWriteAllowed()) {
        return;
      }

      didWrite = true;

      try {
        const [fs, path] = await Promise.all([import('node:fs'), import('node:path')]);
        logClerkAgentRulesResult(writeClerkAgentRules({ cwd: config.root, fs, path, sdks: [sdk] }));
      } catch (error) {
        logClerkAgentRulesError(error);
      }
    },
  };
}
