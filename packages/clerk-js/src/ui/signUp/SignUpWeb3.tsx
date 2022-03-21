import { Web3Provider, Web3Strategy } from '@clerk/types';
import React from 'react';
import { ButtonSet, ButtonSetOptions, getWeb3ProviderData, handleError } from 'ui/common';
import { useCoreClerk, useEnvironment, useSignUpContext } from 'ui/contexts';

export type Web3Props = {
  web3Options: Web3Strategy[];
  error?: string;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function SignUpWeb3({ error, setError, web3Options }: Web3Props): JSX.Element | null {
  const ctx = useSignUpContext();
  const environment = useEnvironment();

  const clerk = useCoreClerk();
  const { displayConfig } = environment;

  const startWeb3 = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await clerk.authenticateWithMetamask({
        redirectUrl: ctx.afterSignUpUrl || displayConfig.afterSignUpUrl,
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
      flow='sign-up'
      handleClick={startWeb3}
      options={options}
    />
  );
}
