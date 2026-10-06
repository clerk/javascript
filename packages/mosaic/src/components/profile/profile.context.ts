import React from 'react';

export type ProfileNavLayout = 'column' | 'select' | 'sheet';

export interface ProfileContextValue {
  titleId: string;
  renderBranding: boolean;
  compact: boolean;
  navLayout: ProfileNavLayout;
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  value: string;
  selectPage: (value: string) => void;
  navItems: React.ReactNode;
  pageTitleId: string;
  pageTitleRef: React.MutableRefObject<HTMLHeadingElement | null>;
  navTriggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  inline: boolean;
}

export const ProfileContext = React.createContext<ProfileContextValue | null>(null);

export const ContentPanelContext = React.createContext(false);
