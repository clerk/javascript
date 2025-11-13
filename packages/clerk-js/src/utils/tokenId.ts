export interface ParsedTokenId {
  organizationId?: string | null;
  sessionId: string;
  template?: string;
}

/**
 * Utility for building and parsing token identifiers.
 * Token IDs follow the format: sessionId[-template][-organizationId]
 */
export const TokenId = {
  /**
   * Builds a token identifier from session context components.
   *
   * @example
   * ```typescript
   * TokenId.build('sess_123') // 'sess_123'
   * TokenId.build('sess_123', 'custom') // 'sess_123-custom'
   * TokenId.build('sess_123', 'custom', 'org_456') // 'sess_123-custom-org_456'
   * TokenId.build('sess_123', undefined, 'org_456') // 'sess_123-org_456'
   * ```
   */
  build: (sessionId: string, template?: string, organizationId?: string | null): string => {
    return [sessionId, template, organizationId].filter(Boolean).join('-');
  },

  /**
   * Parses a token identifier into its component parts.
   *
   * @example
   * ```typescript
   * TokenId.parse('sess_123', 'sess_123')
   * // { sessionId: 'sess_123', template: undefined, organizationId: undefined }
   *
   * TokenId.parse('sess_123-custom', 'sess_123')
   * // { sessionId: 'sess_123', template: 'custom', organizationId: undefined }
   *
   * TokenId.parse('sess_123-custom-org_456', 'sess_123', 'org_456')
   * // { sessionId: 'sess_123', template: 'custom', organizationId: 'org_456' }
   * ```
   */
  parse: (tokenId: string, sessionId: string, organizationId?: string | null): ParsedTokenId => {
    const template = TokenId.extractTemplate(tokenId, sessionId, organizationId);
    return {
      organizationId,
      sessionId,
      template,
    };
  },

  /**
   * Extracts only the template name from a token identifier.
   *
   * @example
   * ```typescript
   * TokenId.extractTemplate('sess_123', 'sess_123') // undefined
   * TokenId.extractTemplate('sess_123-custom', 'sess_123') // 'custom'
   * TokenId.extractTemplate('sess_123-custom-org_456', 'sess_123', 'org_456') // 'custom'
   * TokenId.extractTemplate('sess_123-org_456', 'sess_123', 'org_456') // undefined
   * ```
   */
  extractTemplate: (tokenId: string, sessionId: string, organizationId?: string | null): string | undefined => {
    if (tokenId === sessionId) {
      return undefined;
    }

    if (organizationId && tokenId === `${sessionId}-${organizationId}`) {
      return undefined;
    }

    let remainder = tokenId.slice(sessionId.length + 1);

    if (organizationId && remainder.endsWith(`-${organizationId}`)) {
      remainder = remainder.slice(0, -(organizationId.length + 1));
    }

    return remainder || undefined;
  },
};
