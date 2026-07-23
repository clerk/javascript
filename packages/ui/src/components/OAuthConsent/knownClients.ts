import type React from 'react';

import type { ThemableCssProp } from '@/ui/styledSystem';

import { Claude, OpenAI } from './brandIcons';

/**
 * A curated OAuth client we can recognize and brand on the consent screen.
 * Matching is keyed on the registrable redirect domain (the trusted,
 * backend-resolved signal), never on the app-owner-set name or homepage.
 */
type KnownOAuthClient = {
  name: string;
  icon: React.ComponentType;
  /**
   * Overrides the default badge icon tint. Omit for icons that carry their own
   * fill (e.g. a fixed brand color).
   */
  iconSx?: ThemableCssProp;
  /** Registrable domains (PSL-resolved) that identify this client. */
  domains: string[];
};

const KNOWN_OAUTH_CLIENTS: KnownOAuthClient[] = [
  { name: 'Claude', icon: Claude, domains: ['claude.ai', 'claude.com', 'anthropic.com'] },
  {
    name: 'ChatGPT',
    icon: OpenAI,
    iconSx: t => ({ color: t.colors.$colorForeground }),
    domains: ['chatgpt.com', 'openai.com'],
  },
];

/**
 * Resolves a known OAuth client from its registrable redirect domain, or
 * `undefined` when the domain is empty or unrecognized.
 */
export function getKnownOAuthClient(domain?: string | null): KnownOAuthClient | undefined {
  if (!domain) {
    return undefined;
  }
  const normalized = domain.trim().toLowerCase();
  return KNOWN_OAUTH_CLIENTS.find(client => client.domains.includes(normalized));
}
