import { clerkAgentRulesVitePlugin } from '@clerk/shared/vite';

export const clerkChromeExtensionAgentRules = () => clerkAgentRulesVitePlugin('chrome-extension');
