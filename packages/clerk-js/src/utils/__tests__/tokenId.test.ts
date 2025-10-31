import { describe, expect, it } from 'vitest';

import { TokenId } from '../tokenId';

describe('TokenId.build', () => {
  it('should build token ID with only sessionId', () => {
    expect(TokenId.build('sess_123')).toBe('sess_123');
  });

  it('should build token ID with sessionId and template', () => {
    expect(TokenId.build('sess_123', 'custom')).toBe('sess_123-custom');
  });

  it('should build token ID with sessionId and organizationId', () => {
    expect(TokenId.build('sess_123', undefined, 'org_456')).toBe('sess_123-org_456');
  });

  it('should build token ID with all parameters', () => {
    expect(TokenId.build('sess_123', 'custom', 'org_456')).toBe('sess_123-custom-org_456');
  });

  it('should omit null organizationId', () => {
    expect(TokenId.build('sess_123', 'custom', null)).toBe('sess_123-custom');
  });

  it('should omit undefined template', () => {
    expect(TokenId.build('sess_123', undefined, 'org_456')).toBe('sess_123-org_456');
  });

  it('should handle empty string values by omitting them', () => {
    expect(TokenId.build('sess_123', '', '')).toBe('sess_123');
  });

  it('should handle all optional parameters being undefined', () => {
    expect(TokenId.build('sess_123', undefined, undefined)).toBe('sess_123');
  });
});

describe('TokenId.extractTemplate', () => {
  it('should return undefined when tokenId is just sessionId', () => {
    expect(TokenId.extractTemplate('sess_123', 'sess_123')).toBeUndefined();
  });

  it('should extract template when tokenId is sessionId-template', () => {
    expect(TokenId.extractTemplate('sess_123-custom', 'sess_123')).toBe('custom');
  });

  it('should return undefined when tokenId is sessionId-organizationId', () => {
    expect(TokenId.extractTemplate('sess_123-org_456', 'sess_123', 'org_456')).toBeUndefined();
  });

  it('should extract template when tokenId is sessionId-template-organizationId', () => {
    expect(TokenId.extractTemplate('sess_123-custom-org_456', 'sess_123', 'org_456')).toBe('custom');
  });

  it('should handle template with multiple hyphens', () => {
    expect(TokenId.extractTemplate('sess_123-my-custom-template', 'sess_123')).toBe('my-custom-template');
  });

  it('should extract template with hyphens when organizationId is present', () => {
    expect(TokenId.extractTemplate('sess_123-my-custom-template-org_456', 'sess_123', 'org_456')).toBe(
      'my-custom-template',
    );
  });

  it('should handle null organizationId same as undefined', () => {
    expect(TokenId.extractTemplate('sess_123-custom', 'sess_123', null)).toBe('custom');
  });

  it('should return undefined when organizationId is present but tokenId has no template', () => {
    expect(TokenId.extractTemplate('sess_123-org_456', 'sess_123', 'org_456')).toBeUndefined();
  });

  it('should extract template when organizationId is undefined but present in tokenId', () => {
    expect(TokenId.extractTemplate('sess_123-custom-org_456', 'sess_123', undefined)).toBe('custom-org_456');
  });
});

describe('TokenId.parse', () => {
  it('should parse token ID with only sessionId', () => {
    const result = TokenId.parse('sess_123', 'sess_123');
    expect(result).toEqual({
      organizationId: undefined,
      sessionId: 'sess_123',
      template: undefined,
    });
  });

  it('should parse token ID with sessionId and template', () => {
    const result = TokenId.parse('sess_123-custom', 'sess_123');
    expect(result).toEqual({
      organizationId: undefined,
      sessionId: 'sess_123',
      template: 'custom',
    });
  });

  it('should parse token ID with sessionId and organizationId', () => {
    const result = TokenId.parse('sess_123-org_456', 'sess_123', 'org_456');
    expect(result).toEqual({
      organizationId: 'org_456',
      sessionId: 'sess_123',
      template: undefined,
    });
  });

  it('should parse token ID with all components', () => {
    const result = TokenId.parse('sess_123-custom-org_456', 'sess_123', 'org_456');
    expect(result).toEqual({
      organizationId: 'org_456',
      sessionId: 'sess_123',
      template: 'custom',
    });
  });
});

describe('TokenId.build and TokenId.extractTemplate compatibility', () => {
  it('should round-trip: sessionId only', () => {
    const sessionId = 'sess_123';
    const tokenId = TokenId.build(sessionId);
    const extracted = TokenId.extractTemplate(tokenId, sessionId);
    expect(extracted).toBeUndefined();
  });

  it('should round-trip: sessionId + template', () => {
    const sessionId = 'sess_123';
    const template = 'custom';
    const tokenId = TokenId.build(sessionId, template);
    const extracted = TokenId.extractTemplate(tokenId, sessionId);
    expect(extracted).toBe(template);
  });

  it('should round-trip: sessionId + organizationId (no template)', () => {
    const sessionId = 'sess_123';
    const organizationId = 'org_456';
    const tokenId = TokenId.build(sessionId, undefined, organizationId);
    const extracted = TokenId.extractTemplate(tokenId, sessionId, organizationId);
    expect(extracted).toBeUndefined();
  });

  it('should round-trip: sessionId + template + organizationId', () => {
    const sessionId = 'sess_123';
    const template = 'custom';
    const organizationId = 'org_456';
    const tokenId = TokenId.build(sessionId, template, organizationId);
    const extracted = TokenId.extractTemplate(tokenId, sessionId, organizationId);
    expect(extracted).toBe(template);
  });

  it('should round-trip: template with hyphens', () => {
    const sessionId = 'sess_123';
    const template = 'my-custom-template';
    const tokenId = TokenId.build(sessionId, template);
    const extracted = TokenId.extractTemplate(tokenId, sessionId);
    expect(extracted).toBe(template);
  });

  it('should round-trip: template with hyphens + organizationId', () => {
    const sessionId = 'sess_123';
    const template = 'my-custom-template';
    const organizationId = 'org_456';
    const tokenId = TokenId.build(sessionId, template, organizationId);
    const extracted = TokenId.extractTemplate(tokenId, sessionId, organizationId);
    expect(extracted).toBe(template);
  });

  it('should round-trip: null organizationId behaves like undefined', () => {
    const sessionId = 'sess_123';
    const template = 'custom';
    const tokenId = TokenId.build(sessionId, template, null);
    const extracted = TokenId.extractTemplate(tokenId, sessionId, null);
    expect(extracted).toBe(template);
  });
});
