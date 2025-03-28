import { describe, expect, it } from 'vitest';

import { CLERK_CSP_VALUES, createCSPHeader } from '../utils';

describe('createCSPHeader', () => {
  it('preserves all original CLERK_CSP_VALUES directives', () => {
    const result = createCSPHeader('custom-directive new-value');
    const resultDirectives = result.split('; ');

    // All original directives should be present
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      const directiveString = `${directive} ${values.join(' ')}`;
      expect(resultDirectives).toContain(directiveString);
    });
  });

  it('merges and deduplicates values for common directives', () => {
    const result = createCSPHeader('script-src new-value existing-value');
    const resultDirectives = result.split('; ');

    const scriptSrcDirective = resultDirectives.find(d => d.startsWith('script-src')) ?? '';
    expect(scriptSrcDirective).toBeDefined();

    // Should contain both original and new values, deduplicated
    const values = scriptSrcDirective.replace('script-src ', '').split(' ');
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);

    // Should contain both original and new values
    CLERK_CSP_VALUES['script-src'].forEach(value => {
      expect(values).toContain(value);
    });
    expect(values).toContain('new-value');
  });

  it('adds new directives from custom CSP', () => {
    const result = createCSPHeader('new-directive value1 value2');
    const resultDirectives = result.split('; ');

    expect(resultDirectives).toContain('new-directive value1 value2');
  });
});
