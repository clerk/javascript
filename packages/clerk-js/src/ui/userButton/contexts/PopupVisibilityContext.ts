import { noop } from '@clerk/shared/utils';
import React from 'react';

type PopupVisibility = {
  isPopupVisible: boolean;
  setPopupVisible: (visibility: boolean) => void;
};

export const PopupVisibilityContext = React.createContext<PopupVisibility>({
  isPopupVisible: false,
  setPopupVisible: noop,
});

export const useUserButtonPopupVisibility = () => React.useContext(PopupVisibilityContext);
