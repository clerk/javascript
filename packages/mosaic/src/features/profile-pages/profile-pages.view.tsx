import type { ReactNode } from 'react';
import React from 'react';

import type { ProfileRootProps, ProfileSearchPage } from '../../components/profile';
import { Profile } from '../../components/profile';

/** One destination in a profile's navigation, with the page it opens. */
export interface ProfilePage {
  id: string;
  label: string;
  icon: ReactNode;
  keywords?: readonly string[];
  content: ReactNode;
}

/** A run of pages in the navigation. A labelled group is set apart under its label. */
export interface ProfilePageGroup {
  label?: string;
  pages: readonly ProfilePage[];
}

export interface ProfilePagesViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  /** Names the surface, and the dialog it opens in. */
  label: string;
  /** The navigation, in order. A group without a label lists its pages without a heading. */
  groups: readonly ProfilePageGroup[];
  /** The open page's id. One the navigation does not list opens the first page instead. */
  activePage: string;
  /** Called with a page's id when the user picks it from the navigation. */
  onPageChange: (page: string) => void;
}

/** A `Profile` built from groups of pages: their navigation, and the active page beside it. */
export const ProfilePagesView = React.forwardRef<HTMLDivElement, ProfilePagesViewProps>(function ProfilePagesView(
  { label, groups, activePage, onPageChange, ...rest },
  ref,
) {
  const pages = groups.flatMap(group => group.pages);
  const activeEntry = pages.find(page => page.id === activePage) ?? pages[0];
  const searchPages: ProfileSearchPage[] = pages.map(page => ({
    value: page.id,
    label: page.label,
    icon: page.icon,
    keywords: page.keywords,
  }));

  return (
    <Profile.Root
      ref={ref}
      value={activeEntry?.id ?? activePage}
      onValueChange={onPageChange}
      {...rest}
    >
      <Profile.Title>{label}</Profile.Title>
      <Profile.Nav search={searchPages}>
        {groups.map((group, index) =>
          group.label === undefined ? (
            <NavItems
              key={index}
              pages={group.pages}
            />
          ) : (
            <Profile.NavGroup
              key={index}
              label={group.label}
            >
              <NavItems pages={group.pages} />
            </Profile.NavGroup>
          ),
        )}
      </Profile.Nav>
      <Profile.Content pageTitle={activeEntry?.label}>
        {pages.map(page => (
          <Profile.ContentPanel
            key={page.id}
            value={page.id}
          >
            {page.content}
          </Profile.ContentPanel>
        ))}
      </Profile.Content>
    </Profile.Root>
  );
});

function NavItems({ pages }: { pages: readonly ProfilePage[] }) {
  return pages.map(page => (
    <Profile.NavItem
      key={page.id}
      value={page.id}
      icon={page.icon}
    >
      {page.label}
    </Profile.NavItem>
  ));
}
