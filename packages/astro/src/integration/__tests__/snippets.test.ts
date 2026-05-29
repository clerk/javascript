import type { ClerkOptions } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { buildBeforeHydrationSnippet, buildPageLoadSnippet } from '../snippets';

const buildSnippetOptions = (internalParams: ClerkOptions) => ({
  command: 'build',
  packageName: '@clerk/astro',
  buildImportPath: '@clerk/astro/internal',
  internalParams,
});

describe('integration snippets', () => {
  it('imports bundled Clerk UI instead of serializing the constructor for before-hydration scripts', () => {
    class ClerkUI {}

    const snippet = buildBeforeHydrationSnippet(
      buildSnippetOptions({
        publishableKey: 'pk_test_123',
        ui: {
          __brand: '__clerkUI',
          version: '1.2.3',
          ClerkUI,
        },
      } as unknown as ClerkOptions),
    );

    expect(snippet).toContain('import { ui as __internal_clerkAstroUi } from "@clerk/ui";');
    expect(snippet).toContain(
      'await runInjectionScript({ ...{"publishableKey":"pk_test_123","ui":{"__brand":"__clerkUI","version":"1.2.3"}}, ui: __internal_clerkAstroUi });',
    );
  });

  it('imports bundled Clerk UI for page-load scripts including view-transition reinitialization', () => {
    class ClerkUI {}

    const snippet = buildPageLoadSnippet(
      buildSnippetOptions({
        publishableKey: 'pk_test_123',
        ui: {
          __brand: '__clerkUI',
          version: '1.2.3',
          ClerkUI,
        },
      } as unknown as ClerkOptions),
    );

    expect(snippet).toContain('import { ui as __internal_clerkAstroUi } from "@clerk/ui";');
    expect(snippet).toContain(
      '...{ ...{"publishableKey":"pk_test_123","ui":{"__brand":"__clerkUI","version":"1.2.3"}}, ui: __internal_clerkAstroUi },',
    );
    expect(snippet).toContain(
      'await runInjectionScript({ ...{"publishableKey":"pk_test_123","ui":{"__brand":"__clerkUI","version":"1.2.3"}}, ui: __internal_clerkAstroUi });',
    );
  });

  it('keeps default snippets free of the bundled UI import', () => {
    const snippet = buildBeforeHydrationSnippet(
      buildSnippetOptions({
        publishableKey: 'pk_test_123',
      } as unknown as ClerkOptions),
    );

    expect(snippet).not.toContain('@clerk/ui');
    expect(snippet).toContain('await runInjectionScript({"publishableKey":"pk_test_123"});');
  });
});
