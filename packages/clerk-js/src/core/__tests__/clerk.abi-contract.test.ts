/**
 * Cross-bundle ABI contract test.
 *
 * Tripwire #1 of two (the other is `clerk.abi-usage-scan.test.ts`).
 *
 * Asserts that every member in `__abi__/manifest.ts` is present on a fresh
 * `new Clerk(pk)` with the right `kind`. This catches *implementation
 * removal*: deleting or renaming a member on `Clerk` while leaving the
 * manifest unchanged fails here.
 *
 * The companion snapshot test pins the manifest's membership list itself,
 * so deleting a manifest row also fails (separately from the usage scanner,
 * which catches manifest rows that contradict real consumer usage).
 *
 * See `__abi__/manifest.ts` for scope and policy.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { ABI_MEMBERS, type AbiMember, type AbiMemberKind } from '../__abi__/manifest';
import { Clerk } from '../clerk';
import { Client, Environment } from '../resources/internal';

vi.mock('../resources/Client');
vi.mock('../resources/Environment');

vi.mock('../auth/devBrowser', () => ({
  createDevBrowser: () => ({
    clear: vi.fn(),
    setup: vi.fn(),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    setDevBrowser: vi.fn(),
    removeDevBrowser: vi.fn(),
    refreshCookies: vi.fn(),
  }),
}));

Client.getOrCreateInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn() }));
Environment.getInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn(() => Promise.resolve({})) }));

const publishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';
const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../../../..');
const clerkSource = readFileSync(resolve(currentDir, '../clerk.ts'), 'utf8');

/**
 * Look up the property descriptor for `name`, walking the prototype chain.
 * Returns `undefined` if the member does not exist anywhere on the instance
 * or its prototype chain (stopping at `Object.prototype`).
 *
 * Using descriptors rather than direct access lets us assert presence
 * without triggering side effects on lazy getters (notably
 * `__internal_queryClient`, which kicks off a dynamic import on read).
 */
function findDescriptor(instance: object, name: string): PropertyDescriptor | undefined {
  if (Object.getOwnPropertyDescriptor(instance, name)) {
    return Object.getOwnPropertyDescriptor(instance, name);
  }
  let proto: object | null = Object.getPrototypeOf(instance);
  while (proto && proto !== Object.prototype) {
    const d = Object.getOwnPropertyDescriptor(proto, name);
    if (d) {
      return d;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceDeclaresMember(name: string): boolean {
  const escaped = escapeRegExp(name);
  return new RegExp(String.raw`\b(?:get\s+)?${escaped}\b(?:\s*[(:=]|[?!]?:)`).test(clerkSource);
}

function assertMember(instance: Clerk, member: AbiMember): void {
  const { name, kind } = member;
  const descriptor = findDescriptor(instance, name);
  const declaredInSource = sourceDeclaresMember(name);

  expect(
    descriptor || declaredInSource,
    `manifest member ${name} is missing on the Clerk instance and in clerk.ts`,
  ).toBeTruthy();

  const checkers: Record<AbiMemberKind, (d: PropertyDescriptor) => void> = {
    getter: d => {
      expect(typeof d.get, `${name} is declared kind=getter; expected an ES getter`).toBe('function');
    },
    method: d => {
      // Arrow methods are own data properties whose value is a function.
      // Method-syntax methods are prototype data properties whose value is a function.
      const value = 'value' in d ? d.value : undefined;
      expect(typeof value, `${name} is declared kind=method; expected a function value`).toBe('function');
    },
    property: d => {
      expect('value' in d || typeof d.get === 'function', `${name} kind=property must be a data or accessor property`).toBe(
        true,
      );
    },
    'assignable-slot': d => {
      // Assignable slots are declared as `public X: T | undefined`. They must
      // be writable so external SDKs (e.g. @clerk/expo) can install handlers.
      expect(d.writable !== false, `${name} kind=assignable-slot must be writable`).toBe(true);
    },
  };

  if (descriptor) {
    checkers[kind](descriptor);
    return;
  }

  expect(
    kind === 'property' || kind === 'assignable-slot',
    `${name} is declared kind=${kind}; expected an emitted instance or prototype descriptor`,
  ).toBe(true);
}

describe('Cross-bundle ABI contract', () => {
  it('every manifest member exists on a fresh Clerk instance with the right kind', () => {
    const clerk = new Clerk(publishableKey);
    for (const member of ABI_MEMBERS) {
      assertMember(clerk, member);
    }
  });

  it('manifest membership is pinned (drift detection)', () => {
    // Snapshot the sorted list of member names. Adding a member updates the
    // snapshot freely. Removing a member fails this test, which is the
    // intended tripwire: forces the PR author to delete a snapshot line,
    // which forces a reviewer to ask "what about consumers in the wild?".
    const names = ABI_MEMBERS.map(m => m.name).sort();
    expect(names).toMatchInlineSnapshot(`
      [
        "__internal_addNavigationListener",
        "__internal_attemptToEnableEnvironmentSetting",
        "__internal_closeCheckout",
        "__internal_closeEnableOrganizationsPrompt",
        "__internal_closePlanDetails",
        "__internal_closeReverification",
        "__internal_closeSubscriptionDetails",
        "__internal_country",
        "__internal_createPublicCredentials",
        "__internal_environment",
        "__internal_getCachedResources",
        "__internal_getOption",
        "__internal_getPublicCredentials",
        "__internal_isWebAuthnAutofillSupported",
        "__internal_isWebAuthnPlatformAuthenticatorSupported",
        "__internal_isWebAuthnSupported",
        "__internal_lastEmittedResources",
        "__internal_loadStripeJs",
        "__internal_mountOAuthConsent",
        "__internal_navigateWithError",
        "__internal_onAfterResponse",
        "__internal_onBeforeRequest",
        "__internal_openCheckout",
        "__internal_openEnableOrganizationsPrompt",
        "__internal_openPlanDetails",
        "__internal_openReverification",
        "__internal_openSubscriptionDetails",
        "__internal_queryClient",
        "__internal_reloadInitialResources",
        "__internal_setActiveInProgress",
        "__internal_setEnvironment",
        "__internal_state",
        "__internal_unmountOAuthConsent",
        "__internal_updateProps",
      ]
    `);
  });

  it('every consumer reference in the manifest points to an existing packages/* directory name', () => {
    // Sanity check: the `consumers` arrays are not free-form. They must match
    // real package directory names so the usage scanner can find them.
    const packagesDir = resolve(repoRoot, 'packages');
    const known = new Set(
      readdirSync(packagesDir).filter(dir => existsSync(resolve(packagesDir, dir, 'package.json'))),
    );
    for (const member of ABI_MEMBERS) {
      for (const consumer of member.consumers) {
        expect(known.has(consumer), `consumer "${consumer}" on ${member.name} is not a known packages/* dir`).toBe(true);
      }
    }
  });
});
