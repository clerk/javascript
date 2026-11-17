import type { ReactNode } from 'react';
import React from 'react';

import type { ProfileRootProps } from '../../components/profile';
import { Profile } from '../../components/profile';

type ProfilePageLayout = Pick<ProfilePagesViewProps, 'contentTitle' | 'contentBackAction' | 'contentFooter'>;
export type RenderProfilePage = (panel: ReactNode, layout?: ProfilePageLayout) => React.ReactElement;

export type ProfilePageContent = ReactNode | ((render: RenderProfilePage) => React.ReactElement);

/** One destination in a profile's navigation, with the page it opens. */
export interface ProfilePage {
  id: string;
  label: string;
  icon: ReactNode;
  content: ProfilePageContent;
}

/** A run of pages in the navigation. A labelled group is set apart under its label. */
export interface ProfilePageGroup {
  label?: string;
  pages: readonly ProfilePage[];
}

export interface ProfilePagesViewProps extends Omit<ProfileRootProps, 'children' | 'value' | 'onValueChange'> {
  /** Names the surface, and the dialog it opens in. */
  label: string;
  contentTitle?: ReactNode;
  contentBackAction?: ReactNode;
  contentFooter?: ReactNode;
  /** The navigation, in order. A group without a label lists its pages without a heading. */
  groups: readonly ProfilePageGroup[];
  /** The open page's id. One the navigation does not list opens the first page instead. */
  activePage: string;
  /** Called with a page's id when the user picks it from the navigation. */
  onPageChange: (page: string) => void;
}

/** A `Profile` built from groups of pages: their navigation, and the active page beside it. */
export const ProfilePagesView = React.forwardRef<HTMLDivElement, ProfilePagesViewProps>(function ProfilePagesView(
  { label, groups, activePage, onPageChange, contentTitle, contentBackAction, contentFooter, ...rest },
  ref,
) {
  const pages = groups.flatMap(group => group.pages);
  const activeEntry = pages.find(page => page.id === activePage) ?? pages[0];

  const renderPage: RenderProfilePage = (panel, layout = {}) => (
    <Profile.Content
      pageTitle={layout.contentTitle ?? contentTitle ?? activeEntry?.label}
      backAction={layout.contentBackAction ?? contentBackAction}
      footer={layout.contentFooter ?? contentFooter}
    >
      {pages.map(page => (
        <Profile.ContentPanel
          key={page.id}
          value={page.id}
        >
          {typeof page.content === 'function' ? page === activeEntry && panel : page.content}
        </Profile.ContentPanel>
      ))}
    </Profile.Content>
  );

  return (
    <Profile.Root
      ref={ref}
      value={activeEntry?.id ?? activePage}
      onValueChange={onPageChange}
      {...rest}
    >
      <Profile.Title>{label}</Profile.Title>
      <Profile.Nav>
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
      {typeof activeEntry?.content === 'function' ? activeEntry.content(renderPage) : renderPage(activeEntry?.content)}
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
