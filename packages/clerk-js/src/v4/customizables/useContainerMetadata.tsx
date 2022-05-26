import React from 'react';

type ContainerMetadataProps = {
  flow: 'signIn' | 'signUp';
  page: 'start' | 'emailOtp' | 'phoneOtp';
  blockingAction?: boolean;
};

type ContainerMetadataContextValue = ContainerMetadataProps;
const ContainerMetadataContext = React.createContext<{ value: ContainerMetadataContextValue } | undefined>(undefined);
ContainerMetadataContext.displayName = 'Clerk__ContainerMetadataContext';

export const ContainerMetadata = (props: React.PropsWithChildren<ContainerMetadataProps>) => {
  const { children, ...metadata } = props;
  const value = React.useMemo(() => ({ value: metadata }), []);
  return (
    <ContainerMetadataContext.Provider value={value}>
      <div className={Object.values(metadata).join('-')}>{children}</div>
    </ContainerMetadataContext.Provider>
  );
};

export const useContainerMetadata = (): ContainerMetadataProps => {
  const ctx = React.useContext(ContainerMetadataContext);
  if (!ctx) {
    throw new Error('ContainerMetadataContext not found');
  }
  return ctx.value;
};
