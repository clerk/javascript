import { readFile } from 'fs/promises';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Snapshots for `extract-methods.mjs` output. Each `.mdx` under `__snapshots__/` is a frozen copy of a representative file produced by `typedoc:generate`. Refactors to the plugin or its helpers should leave these files byte-identical; a diff means the change is observable in the published docs and needs a human decision.
 *
 * Run `pnpm typedoc:generate` first to populate `.typedoc/docs/`, then `vitest run` here.
 * To intentionally update a snapshot after reviewing the diff: `vitest run -u`.
 *
 * Coverage targets one case per non-trivial code path:
 *
 * - `methods/sign-out.mdx`           – simple zero-arg callable
 * - `methods/handle-redirect-callback.mdx` – multi-param `parametersTable` with nested rows
 * - `methods/handle-email-link-verification.mdx` – required parent (`params`) flattened to `.`
 * - `methods/join-waitlist.mdx`      – single nominal-param section (`JoinWaitlistParams`)
 * - `methods/create.mdx` (api-key)   – another single-nominal-param case + warning callout
 * - `methods/check-authorization.mdx` – generic instantiation (`CheckAuthorization`)
 * - `methods/email-code-send-code.mdx` – qualified name from `@extractMethods` parent
 * - `methods/email-link.mdx`         – `@extractMethods` namespace index (non-callables)
 * - `properties.mdx` (clerk)         – properties table sliced from already-prettified page
 * - `clerk.mdx`                      – main page after Properties has been stripped
 * - `properties.mdx` (user-resource) – properties with external type links and metadata
 */
const DOCS_DIR = join(process.cwd(), 'docs');

async function readGenerated(relPath: string) {
  return readFile(join(DOCS_DIR, relPath), 'utf-8');
}

describe('extract-methods snapshots', () => {
  it('simple callable: clerk.signOut()', async () => {
    const content = await readGenerated('shared/clerk/methods/sign-out.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk-methods-sign-out.mdx');
  });

  it('multi-param method with nested rows: clerk.handleRedirectCallback()', async () => {
    const content = await readGenerated('shared/clerk/methods/handle-redirect-callback.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk-methods-handle-redirect-callback.mdx');
  });

  it('required-parent flatten uses `.` not `?.`: clerk.handleEmailLinkVerification()', async () => {
    const content = await readGenerated('shared/clerk/methods/handle-email-link-verification.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk-methods-handle-email-link-verification.mdx');
  });

  it('single nominal-param section: clerk.joinWaitlist()', async () => {
    const content = await readGenerated('shared/clerk/methods/join-waitlist.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk-methods-join-waitlist.mdx');
  });

  it('single nominal-param + warning callout: apiKeys.create()', async () => {
    const content = await readGenerated('shared/api-key-resource/methods/create.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/api-key-resource-methods-create.mdx');
  });

  it('generic instantiation: session.checkAuthorization()', async () => {
    const content = await readGenerated('shared/session-resource/methods/check-authorization.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/session-resource-methods-check-authorization.mdx');
  });

  it('@extractMethods child: signInFuture.emailCode.sendCode()', async () => {
    const content = await readGenerated('shared/sign-in-future-resource/methods/email-code-send-code.mdx');
    await expect(content).toMatchFileSnapshot(
      './__snapshots__/sign-in-future-resource-methods-email-code-send-code.mdx',
    );
  });

  it('@extractMethods namespace index: signInFuture.emailLink', async () => {
    const content = await readGenerated('shared/sign-in-future-resource/methods/email-link.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/sign-in-future-resource-methods-email-link.mdx');
  });

  it('properties extracted + prettier-aligned: clerk', async () => {
    const content = await readGenerated('shared/clerk/properties.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk-properties.mdx');
  });

  it('main page after Properties strip: clerk', async () => {
    const content = await readGenerated('shared/clerk/clerk.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/clerk.mdx');
  });

  it('properties with external type links: user-resource', async () => {
    const content = await readGenerated('shared/user-resource/properties.mdx');
    await expect(content).toMatchFileSnapshot('./__snapshots__/user-resource-properties.mdx');
  });
});
