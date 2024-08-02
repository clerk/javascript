import * as React from 'react';

interface GetHelp {
  showHelp: boolean;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GetHelpContext = React.createContext<GetHelp | null>(null);

export const useGetHelp = () => {
  const context = React.useContext(GetHelpContext);
  if (!context) {
    throw new Error('useGetHelp must be used within GetHelpContext.Provider');
  }
  return context;
};
