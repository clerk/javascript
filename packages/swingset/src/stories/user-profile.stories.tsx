import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

export { default as __source } from './user-profile.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfile',
  label: 'User profile',
  layout: 'wide',
  source: 'packages/mosaic/src/features/user-profile/user-profile.view.tsx',
};

/**
 * The profile as a page's content — `elevation='flush'`, the way a `Card` chooses its elevation:
 * unframed, flush with its host, scrolling with the page. The fixture stands in for the model and
 * controller: every page's data, and actions that update it, so the surface behaves.
 */
export function Default() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}

/**
 * The same profile as an overlay: opened from a trigger on the page into a `profile` dialog, which
 * positions it while the profile paints itself, names the dialog, and carries its dismiss.
 */
export function Overlay() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
      <Dialog.Popup variant='profile'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

export function FlatContainedGroups() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <>
      <style>{`
        @scope {
          :scope {
            --section-stack-gap: 1.5rem;
          }
          .cl-section,
          :has(> .cl-section, > div > .cl-section):not([class*='-panel']) {
            gap: var(--section-stack-gap) !important;
          }
          .cl-section-surface {
            padding: 0 2px 2px !important;
            border: 1px solid var(--cl-color-border-subtle) !important;
            border-radius: calc(var(--cl-radius-xl) + 3px) !important;
            background: var(--cl-color-background-subtle) !important;
          }
          .cl-section-surface:has(.cl-section-actions > .cl-button[data-color='negative']) {
            border-color: transparent !important;
            background: var(--cl-color-negative-subtle) !important;
          }
          .cl-section-surface:has(.cl-section-actions > .cl-button[data-color='negative']) > .cl-section-header .cl-section-label {
            color: var(--cl-color-negative) !important;
          }
          .cl-section-header {
            margin: 0 !important;
            padding: 0.625rem calc(1rem + 3px) !important;
            border: none !important;
          }
          .cl-section-header .cl-section-label {
            font-family: var(--cl-font-family-sans) !important;
            font-size: var(--cl-text-base-size) !important;
            font-weight: var(--cl-font-semibold) !important;
            line-height: var(--cl-text-base-leading) !important;
          }
          .cl-section-header .cl-button {
            padding: 0 !important;
            border: none !important;
            background: none !important;
          }
          .cl-section-items {
            margin-inline: 0 !important;
            padding-inline: 0 !important;
            border: 1px solid var(--cl-color-border) !important;
            border-radius: var(--cl-radius-xl) !important;
            background: var(--cl-color-background) !important;
          }
          .cl-section-items > .cl-section-item {
            padding-inline: calc(var(--cl-spacing) * 4) !important;
          }
          .cl-section-items .cl-section-item {
            min-height: var(--cl-section-row-min-height) !important;
          }
          .cl-section-surface > .cl-section-row {
            margin-inline: 0 !important;
            padding-inline: calc(var(--cl-spacing) * 4) !important;
            border-style: solid !important;
            border-color: var(--cl-color-border) !important;
            border-width: 1px 1px 0 !important;
            background: var(--cl-color-background) !important;
          }
          .cl-section-surface > .cl-section-row:first-child,
          .cl-section-surface > .cl-section-header + .cl-section-row {
            border-start-start-radius: var(--cl-radius-xl) !important;
            border-start-end-radius: var(--cl-radius-xl) !important;
          }
          .cl-section-surface > .cl-section-row:last-child {
            border-bottom-width: 1px !important;
            border-end-start-radius: var(--cl-radius-xl) !important;
            border-end-end-radius: var(--cl-radius-xl) !important;
          }
        }
      `}</style>
      <UserProfileView
        activePage={activePage}
        pages={pages}
        onPageChange={setActivePage}
        elevation='flush'
      />
    </>
  );
}
