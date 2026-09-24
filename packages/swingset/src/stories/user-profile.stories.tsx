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
          .cl-user-profile-security-panel .cl-section:first-child > .cl-section-group:first-child > .cl-section-title {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            margin: -1px !important;
            padding: 0 !important;
            overflow: hidden !important;
            clip-path: inset(50%) !important;
            white-space: nowrap !important;
            border: 0 !important;
          }
          .cl-section,
          :has(> .cl-section, > div > .cl-section):not([class*='-panel']) {
            gap: var(--section-stack-gap) !important;
          }
          .cl-section-group:not([data-variant='contained']),
          .cl-section-group[data-variant='contained'] > .cl-section-surface {
            row-gap: 0 !important;
            padding: 0 2px 2px !important;
            border: 1px solid var(--cl-color-border-subtle) !important;
            border-radius: calc(var(--cl-radius-xl) + 3px) !important;
            background: var(--cl-color-background-subtle) !important;
          }
          .cl-section-group > .cl-section-title,
          .cl-section-group > :has(> .cl-section-title),
          .cl-section-header {
            margin: 0 !important;
            padding: 0.625rem calc(1rem + 3px) !important;
            border: none !important;
          }
          .cl-section-group:has(.cl-section-actions > .cl-button[data-color='negative']) {
            border-color: transparent !important;
            background: var(--cl-color-negative-subtle) !important;
          }
          .cl-section-group:has(.cl-section-actions > .cl-button[data-color='negative']) > .cl-section-title {
            color: var(--cl-color-negative) !important;
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
            border: 1px solid var(--cl-color-border) !important;
            border-radius: var(--cl-radius-xl) !important;
            background: var(--cl-color-background) !important;
          }
          .cl-section-group:not([data-variant='contained']) > .cl-section-surface > .cl-section-row {
            margin-inline: 0 !important;
            padding-inline: calc(var(--cl-spacing) * 4) !important;
          }
          .cl-section-items {
            padding-inline: 0 !important;
          }
          .cl-section-items > .cl-section-item {
            padding-inline: calc(var(--cl-spacing) * 4) !important;
          }
          .cl-section-items .cl-section-item {
            min-height: var(--cl-section-row-min-height) !important;
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
