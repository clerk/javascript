import { describe, expect, it } from 'vitest';

import { CLERK_CSP_VALUES, createCSPHeader } from '../utils';

describe('createCSPHeader', () => {
  it('returns default Clerk CSP values when no header is provided', () => {
    const result = createCSPHeader();
    const resultDirectives = result.split('; ');

    // Verify all required Clerk directives are present
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      expect(resultDirectives).toContain(`${directive} ${values.join(' ')}`);
    });
  });

  it('merges custom directives with Clerk defaults', () => {
    const customHeader = 'default-src none; script-src self unsafe-inline';
    const result = createCSPHeader(customHeader);
    const resultDirectives = result.split('; ');

    // Verify custom values override Clerk defaults
    expect(resultDirectives).toContain('default-src none');
    expect(resultDirectives).toContain('script-src self unsafe-inline');

    // Verify other Clerk defaults remain unchanged
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      if (directive !== 'default-src' && directive !== 'script-src') {
        expect(resultDirectives).toContain(`${directive} ${values.join(' ')}`);
      }
    });
  });

  it('preserves custom directives not in Clerk defaults', () => {
    const customHeader = 'custom-directive value; another-directive test';
    const result = createCSPHeader(customHeader);
    const resultDirectives = result.split('; ');

    // Verify custom directives are preserved
    expect(resultDirectives).toContain('custom-directive value');
    expect(resultDirectives).toContain('another-directive test');

    // Verify all Clerk defaults are present
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      expect(resultDirectives).toContain(`${directive} ${values.join(' ')}`);
    });
  });

  it('handles multiple directives and values correctly', () => {
    const customHeader = 'default-src none; script-src self unsafe-inline; custom-directive value';
    const result = createCSPHeader(customHeader);
    const resultDirectives = result.split('; ');

    // Verify all directives are present with correct values
    expect(resultDirectives).toContain('default-src none');
    expect(resultDirectives).toContain('script-src self unsafe-inline');
    expect(resultDirectives).toContain('custom-directive value');

    // Verify total number of directives (Clerk defaults + custom)
    const expectedDirectiveCount = Object.keys(CLERK_CSP_VALUES).length + 1; // +1 for custom-directive
    expect(resultDirectives).toHaveLength(expectedDirectiveCount);
  });

  it('handles empty or invalid input gracefully', () => {
    const emptyResult = createCSPHeader('');
    const emptyDirectives = emptyResult.split('; ');

    // Verify empty input returns all Clerk defaults
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      expect(emptyDirectives).toContain(`${directive} ${values.join(' ')}`);
    });

    const invalidResult = createCSPHeader('invalid-directive');
    const invalidDirectives = invalidResult.split('; ');

    // Verify invalid input returns all Clerk defaults
    Object.entries(CLERK_CSP_VALUES).forEach(([directive, values]) => {
      expect(invalidDirectives).toContain(`${directive} ${values.join(' ')}`);
    });
  });
});
