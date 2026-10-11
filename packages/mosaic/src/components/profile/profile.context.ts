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
  setNavItems: (items: React.ReactNode) => void;
  pageTitleId: string;
  pageTitleRef: React.MutableRefObject<HTMLHeadingElement | null>;
  navTriggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  inline: boolean;
  registerSearchTarget: (id: string, element: HTMLElement | null) => void;
  revealSearchResult: (page: string, target: string | null) => void;
  highlightedTarget: string | null;
  clearHighlight: () => void;
}

export const ProfileContext = React.createContext<ProfileContextValue | null>(null);

export function useProfileContext(part: string): ProfileContextValue {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error(`${part} must be rendered inside Profile.Root`);
  }
  return context;
}

export const ContentPanelContext = React.createContext(false);
