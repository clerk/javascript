import { Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';
import { ButtonSet, ButtonSetOptions, getWeb3ProviderData, handleError } from 'ui/common';
import { useCoreClerk, useEnvironment, useSignInContext } from 'ui/contexts';

export type Web3Props = {
  web3Options: Web3Strategy[];
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function Web3({ error, setError, web3Options }: Web3Props): JSX.Element | null {
  const clerk = useCoreClerk();
  const ctx = useSignInContext();
  const { displayConfig } = useEnvironment();

  const startWeb3 = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await clerk.authenticateWithMetamask({
        redirectUrl: ctx.afterSignInUrl || displayConfig.afterSignInUrl,
      });
    } catch (err) {
      handleError(err, [], setError);
    }
  };

  const options = web3Options.reduce<ButtonSetOptions[]>((memo, o) => {
    const key = o.match(/web3_([a-z0-9]+)_signature/)![1] as Web3Provider;
    const data = getWeb3ProviderData(key);

    if (data) {
      memo.push({
        ...data,
        strategy: o,
      });
    }

    return memo;
  }, []);

  return (
    <ButtonSet
      buttonClassName='cl-web3-button'
      className='cl-web3-button-group'
      error={error}
      flow='sign-in'
      handleClick={startWeb3}
      options={options}
    />
  );
}
