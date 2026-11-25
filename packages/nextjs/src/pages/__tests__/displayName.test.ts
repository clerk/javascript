import { InternalClerkProvider } from '@clerk/react/internal';
import { describe, expect, it } from 'vitest';

describe('pages/ClerkProvider', () => {
  it('does not rename the shared InternalClerkProvider when the module is loaded', async () => {
    const before = InternalClerkProvider.displayName;

    await import('../ClerkProvider.js');

    // The App Router provider renders the same component. Renaming it at module load changes the
    // component name between a PPR prerender and its resume, which makes React abort the resume.
    expect(InternalClerkProvider.displayName).toBe(before);
    expect(InternalClerkProvider.displayName).toBe('ClerkProvider');
  });
});
