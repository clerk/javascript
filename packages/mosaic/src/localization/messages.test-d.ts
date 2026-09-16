import type { ReactNode } from 'react';
import { describe, test } from 'vitest';

import { fill, plural, rich } from './messages';

// Message files are `as const`, so a template's placeholders are known at the type level and the
// helpers require exactly those params and tags. A plain `string` template keeps the loose shape.

const m = {
  open: 'Open account menu for {name}',
  label: 'Account',
  members: { one: '{count} member', other: '{count} members' },
  seats: { one: '{count} seat in {org}', other: '{count} seats in {org}' },
  removal: '{#strong}{emailAddress}{/strong} will be removed.',
  countdown: 'Resend ({seconds})',
  divider: 'before {#rule/} after',
} as const;

const strong = (children?: ReactNode) => children;

describe('fill', () => {
  test('requires every placeholder and rejects unknown ones', () => {
    fill(m.open, { name: 'Sam' });
    // @ts-expect-error name is required
    fill(m.open, {});
    // @ts-expect-error nope is not a placeholder
    fill(m.open, { name: 'Sam', nope: 1 });
    fill(m.label, {});
    // @ts-expect-error label has no placeholders
    fill(m.label, { name: 'Sam' });
  });

  test('keeps the loose shape for a plain string', () => {
    const template: string = m.open;
    fill(template, {});
    fill(template, { anything: 1 });
  });
});

describe('plural', () => {
  test('supplies count and requires the remaining placeholders', () => {
    plural(m.members, 2);
    plural(m.members, 2, 'de');
    plural(m.seats, 2, 'en', { org: 'Clerk' });
    // @ts-expect-error seats needs org
    plural(m.seats, 2);
    // @ts-expect-error members has nothing beyond count
    plural(m.members, 2, 'en', { org: 'Clerk' });
  });
});

describe('rich', () => {
  test('requires the values and components the template names', () => {
    rich(m.removal, { values: { emailAddress: 'a@b.c' }, components: { strong } });
    // @ts-expect-error strong is required
    rich(m.removal, { values: { emailAddress: 'a@b.c' } });
    // @ts-expect-error emailAddress is required
    rich(m.removal, { components: { strong } });
    rich(m.countdown, { values: { seconds: 9 } });
    rich(m.divider, { components: { rule: () => null } });
    rich(m.label);
    // @ts-expect-error label takes no options
    rich(m.label, { values: { x: 1 } });
  });
});
