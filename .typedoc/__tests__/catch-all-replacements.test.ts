import { describe, expect, it } from 'vitest';

// @ts-expect-error — .mjs plugin has no type declarations
import { applyCatchAllMdReplacements } from '../custom-plugin.mjs';

/**
 * Unit coverage for the `getCatchAllReplacements()` rules exercised through the
 * exported `applyCatchAllMdReplacements()` entry point.
 */
describe('applyCatchAllMdReplacements', () => {
  it('renders a single `@example` as "Example: `value`."', () => {
    expect(applyCatchAllMdReplacements('**Example** `foo`')).toBe('Example: `foo`.');
  });

  it('joins multiple `@example` blocks with ", "', () => {
    expect(applyCatchAllMdReplacements('**Examples** `a` `b` `c`')).toBe('Examples: `a`, `b`, `c`.');
  });

  it('does not corrupt examples that contain internal spaces', () => {
    // Regression: splitting the captured group on ' ' rejoined each example's
    // internal spaces with ", ", producing a spurious `,,` inside array literals.
    const input = '**Examples** `["/orgs/:slug", "/orgs/:slug/(.*)"]` `["/orgs/:id", "/orgs/:id/(.*)"]`';
    expect(applyCatchAllMdReplacements(input)).toBe(
      'Examples: `["/orgs/:slug", "/orgs/:slug/(.*)"]`, `["/orgs/:id", "/orgs/:id/(.*)"]`.',
    );
  });
});
