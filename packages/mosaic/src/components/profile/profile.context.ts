import React from 'react';

export interface ProfileContextValue {
  titleId: string;
  renderBranding: boolean;
  compact: boolean;
  navLayout: 'column' | 'popover' | 'sheet';
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  value: string;
  registerPageTitle: (value: string, element: HTMLElement | null) => void;
  pageTitleFor: (value: string) => HTMLElement | null;
  inline: boolean;
}

export const ProfileContext = React.createContext<ProfileContextValue | null>(null);

export const ContentPanelContext = React.createContext<{ titleId: string; value: string } | null>(null);
