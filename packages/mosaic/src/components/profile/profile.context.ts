import React from 'react';

export interface ProfileContextValue {
  /** The id `Profile.Title` renders under; the navigation and the sheet point their names at it. */
  titleId: string;
  renderBranding: boolean;
  /** Below `COMPACT_WIDTH`: the navigation lives in a sheet, opened from a page's title. */
  compact: boolean;
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  /** The selected page, by `value`. */
  value: string;
  /**
   * `Panel.Title` registers the control it renders under its page's `value`, the way a tab
   * registers with the tabs root; the sheet returns focus through `pageTitleFor`.
   */
  registerPageTitle: (value: string, element: HTMLElement | null) => void;
  pageTitleFor: (value: string) => HTMLElement | null;
  /** Flush: the page's own content, selected by `elevation='flush'`. */
  inline: boolean;
}

export const ProfileContext = React.createContext<ProfileContextValue | null>(null);

/** The page a `Panel.Title` is in: the id it renders under, so the panel can be named by it, and the page's `value`. */
export const ContentPanelContext = React.createContext<{ titleId: string; value: string } | null>(null);
