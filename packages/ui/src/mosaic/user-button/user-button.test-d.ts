import type { OrganizationResource, UserResource } from '@clerk/shared/types';
import { describe, expectTypeOf, test } from 'vitest';

import type { UserButtonProps } from '../index';

// The published surface of `@clerk/nextjs/experimental/mosaic`, imported the way a consumer gets it.
// Object literals reach `accept` the same way JSX attributes reach the component, excess-property
// checking and all, so a rejection here is a rejection a consumer would see.
//
// Rejections stay on one line: `@ts-expect-error` only covers the line that follows it, and a
// literal spread over several lines can report its error on any of them.
const accept = (props: UserButtonProps): UserButtonProps => props;

// ─── The surface as a whole ──────────────────────────────────────────────────

describe('UserButtonProps — nothing is required', () => {
  test('the button takes no props at all', () => {
    accept({});
  });

  test('a misspelled prop is caught rather than silently ignored', () => {
    // @ts-expect-error — `userProfileUrls` is not a prop
    accept({ userProfileUrls: '/account' });
  });
});

// ─── mode / modePriority ─────────────────────────────────────────────────────

describe('mode and modePriority — the two vocabularies stay apart', () => {
  test('mode is the three switcher shapes', () => {
    expectTypeOf<UserButtonProps['mode']>().toEqualTypeOf<'combined' | 'orgs' | 'user' | undefined>();
  });

  test('modePriority names the organization in full, unlike mode', () => {
    expectTypeOf<UserButtonProps['modePriority']>().toEqualTypeOf<'organizations' | 'user' | undefined>();
  });

  test('every mode is accepted', () => {
    accept({ mode: 'combined' });
    accept({ mode: 'orgs' });
    accept({ mode: 'user' });
  });

  test('a mode outside the union is rejected', () => {
    // @ts-expect-error — 'organizations' is modePriority's word, not mode's
    accept({ mode: 'organizations' });
  });

  test("modePriority does not take mode's abbreviation", () => {
    // @ts-expect-error — 'orgs' is mode's word, not modePriority's
    accept({ modePriority: 'orgs' });
  });
});

// ─── Routing: url and mode cannot contradict each other ──────────────────────

describe('profile routing — a URL is the whole opt-in to navigation', () => {
  test('a URL alone routes; naming navigation alongside it is allowed', () => {
    accept({ userProfileUrl: '/account' });
    accept({ userProfileUrl: '/account', userProfileMode: 'navigation' });
    accept({ organizationProfileUrl: '/org', organizationProfileMode: 'navigation' });
    accept({ createOrganizationUrl: '/org/new', createOrganizationMode: 'navigation' });
  });

  test('modal is the default, and stands on its own', () => {
    accept({ userProfileMode: 'modal' });
    accept({ organizationProfileMode: 'modal' });
    accept({ createOrganizationMode: 'modal' });
  });

  test('a URL cannot ask for a modal', () => {
    // @ts-expect-error — a URL means navigation; 'modal' contradicts it
    accept({ userProfileUrl: '/account', userProfileMode: 'modal' });
    // @ts-expect-error — same contradiction on the organization profile
    accept({ organizationProfileUrl: '/org', organizationProfileMode: 'modal' });
    // @ts-expect-error — same contradiction on create-organization
    accept({ createOrganizationUrl: '/org/new', createOrganizationMode: 'modal' });
  });

  test('the three surfaces are configured apart — routing one leaves the others modal', () => {
    accept({ userProfileUrl: '/account', organizationProfileMode: 'modal' });
  });
});

describe('after-select URLs — each builder gets the entity it resolves against', () => {
  test('a path template is accepted', () => {
    accept({ afterSelectOrganizationUrl: '/orgs/:slug', afterSelectPersonalUrl: '/me' });
  });

  test('the organization builder receives an organization', () => {
    accept({
      afterSelectOrganizationUrl: organization => {
        expectTypeOf(organization).toEqualTypeOf<OrganizationResource>();
        return `/orgs/${organization.id}`;
      },
    });
  });

  test('the personal builder receives the user, not an organization', () => {
    accept({
      afterSelectPersonalUrl: user => {
        expectTypeOf(user).toEqualTypeOf<UserResource>();
        return `/users/${user.id}`;
      },
    });
  });

  test('a builder must return a string', () => {
    // @ts-expect-error — the URL is what gets navigated to; there is nothing to do with a number
    accept({ afterSelectOrganizationUrl: () => 42 });
  });
});

// ─── Custom menu items ───────────────────────────────────────────────────────

describe('customMenuItems — a row either acts or leaves', () => {
  test('an action row', () => {
    accept({ customMenuItems: [{ id: 'support', label: 'Contact support', onClick: () => {} }] });
  });

  test('a link row', () => {
    accept({ customMenuItems: [{ id: 'docs', label: 'Documentation', href: 'https://example.com' }] });
  });

  test('a row cannot do both', () => {
    // @ts-expect-error — `href` and `onClick` are mutually exclusive
    accept({ customMenuItems: [{ id: 'x', label: 'X', href: '/x', onClick: () => {} }] });
  });

  test('a row must do one', () => {
    // @ts-expect-error — a row with neither `href` nor `onClick` does nothing
    accept({ customMenuItems: [{ id: 'x', label: 'X' }] });
  });

  test('menuItemOrder takes built-in ids and the app’s own, side by side', () => {
    accept({ menuItemOrder: ['docs', 'createOrganization', 'addAccount', 'signOutAll'] });
  });
});

// ─── The profile the button opens ────────────────────────────────────────────

describe('userProfileProps — a navigation entry either has content or goes somewhere', () => {
  test('a page brings its own content', () => {
    accept({ userProfileProps: { customPages: [{ label: 'Usage', path: 'usage', content: null }] } });
  });

  test('a link goes somewhere else', () => {
    accept({ userProfileProps: { customPages: [{ label: 'Docs', path: 'docs', href: 'https://example.com' }] } });
  });

  test('an entry cannot be both', () => {
    // @ts-expect-error — `content` and `href` are mutually exclusive
    accept({ userProfileProps: { customPages: [{ label: 'X', path: 'x', content: null, href: '/x' }] } });
  });

  test('an entry needs a path to be ordered by', () => {
    // @ts-expect-error — `path` identifies the entry, so it is required either way
    accept({ userProfileProps: { customPages: [{ label: 'X', content: null }] } });
  });

  test('pageOrder takes built-in page ids and custom paths, side by side', () => {
    accept({ userProfileProps: { pageOrder: ['account', 'usage', 'security', 'billing', 'apiKeys'] } });
  });
});

// ─── Trigger ─────────────────────────────────────────────────────────────────

describe('trigger flags', () => {
  test('both are booleans', () => {
    accept({ renderTriggerLabel: false, renderPlanBadge: false });
  });

  test('a truthy value of another type is rejected', () => {
    // @ts-expect-error — `renderTriggerLabel` is a boolean, not a label
    accept({ renderTriggerLabel: 'Acme' });
  });
});
