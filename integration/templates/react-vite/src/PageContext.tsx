import React, { createContext, PropsWithChildren, useState } from 'react';

const PageContext = createContext<{
  counter: number;
  setCounter: React.Dispatch<React.SetStateAction<number>>;
}>({
  counter: 0,
  setCounter: () => {},
});

function PageContextProvider({ children }: PropsWithChildren) {
  const [counter, setCounter] = useState<number>(0);
  return (
    <PageContext.Provider
      value={{
        counter,
        setCounter,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export { PageContextProvider, PageContext };
