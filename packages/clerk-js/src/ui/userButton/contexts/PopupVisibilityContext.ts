import React from 'react';
import { noop } from '@clerk/shared/utils';

type PopupVisibility = {
  isPopupVisible: boolean;
  setPopupVisible: (visibility: boolean) => void;
};

export const PopupVisibilityContext = React.createContext<PopupVisibility>({
  isPopupVisible: false,
  setPopupVisible: noop,
});

export const useUserButtonPopupVisibility = () =>
  React.useContext(PopupVisibilityContext);
