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

describe('mode and modePriority', () => {
  test('mode is the three switcher shapes', () => {
    expectTypeOf<UserButtonProps['mode']>().toEqualTypeOf<'combined' | 'organization' | 'user' | undefined>();
  });

  test('modePriority is the two a combined surface chooses between', () => {
    expectTypeOf<UserButtonProps['modePriority']>().toEqualTypeOf<'organization' | 'user' | undefined>();
  });

  test('every mode is accepted', () => {
    accept({ mode: 'combined' });
    accept({ mode: 'organization' });
    accept({ mode: 'user' });
  });

  test('a mode outside the union is rejected', () => {
    // @ts-expect-error - 'orgs' is not the word for it
    accept({ mode: 'orgs' });
  });

  test('combined is not something modePriority can lead with', () => {
    // @ts-expect-error - 'combined' is a mode, not a priority
    accept({ modePriority: 'combined' });
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

describe('renderPlanBadge as a renderer', () => {
  test('names the plan itself, synchronously or not', () => {
    accept({ renderPlanBadge: () => ({ name: 'Enterprise' }) });
    accept({ renderPlanBadge: () => ({ name: 'Enterprise', slug: 'plan_enterprise' }) });
    accept({ renderPlanBadge: async () => ({ name: 'Enterprise', slug: 'plan_enterprise' }) });
  });

  test('declining a badge is a null return, not undefined', () => {
    accept({ renderPlanBadge: () => null });
    // @ts-expect-error — return `null` to draw no badge; `undefined` reads as a forgotten return
    accept({ renderPlanBadge: () => undefined });
  });

  test('a bare label is not a badge', () => {
    // @ts-expect-error — the renderer returns `{ name }`, not the name itself
    accept({ renderPlanBadge: () => 'Enterprise' });
  });

  test('name is required, and slug is a string', () => {
    // @ts-expect-error — `name` is what the badge renders, so it is required
    accept({ renderPlanBadge: () => ({ slug: 'plan_enterprise' }) });
    // @ts-expect-error — `slug` identifies the plan as a string
    accept({ renderPlanBadge: () => ({ name: 'Enterprise', slug: 42 }) });
  });

  test('the renderer takes no arguments', () => {
    // @ts-expect-error — nothing is passed in; read what you need from your own data
    accept({ renderPlanBadge: (organizationId: string) => ({ name: organizationId }) });
  });
});
