import { ArrowRightIcon } from '@clerk/shared/assets/icons';
import { List } from '@clerk/shared/components/list';
import { Spinner } from '@clerk/shared/components/spinner';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { WEB3_PROVIDERS, Web3Provider } from '@clerk/types';
import React, { useState } from 'react';
import { getFieldError, handleError, svgUrl } from 'ui/common';
import { Alert } from 'ui/common/alert';
import { useCoreUser } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { PageHeading } from 'ui/userProfile/pageHeading';
import { generateSignatureWithMetamask, getMetamaskIdentifier } from 'utils/web3';

export function AddNewWeb3Wallet(): JSX.Element {
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [busyProvider, setBusyProvider] = useState<Web3Provider | null>(null);

  const handleClick = async (provider: Web3Provider) => {
    setError(undefined);
    setBusyProvider(provider);

    const identifier = await getMetamaskIdentifier();

    try {
      let web3Wallet = await user.createWeb3Wallet({ web3Wallet: identifier });
      web3Wallet = await web3Wallet.prepareVerification({ strategy: 'web3_metamask_signature' });
      const signature = await generateSignatureWithMetamask({
        identifier,
        nonce: web3Wallet.verification.nonce as string,
      });
      await web3Wallet.attemptVerification({ signature });

      navigate(`../${web3Wallet.id}`);
    } catch (err) {
      const fieldError = getFieldError(err);
      if (fieldError) {
        setError(fieldError.longMessage);
      } else {
        handleError(err, [], setError);
      }

      setBusyProvider(null);
    }
  };

  return (
    <>
      <PageHeading
        title='Back'
        backTo='../'
      />
      <TitledCard
        title={'Add web3 wallet'}
        subtitle={'Connect your web3 wallet'}
        className='cl-themed-card cl-verifiable-field-card'
      >
        <Alert type='error'>{error}</Alert>

        <List>
          {WEB3_PROVIDERS.map(p => (
            <List.Item
              className='cl-list-item'
              key={p.provider}
              onClick={() => handleClick(p.provider)}
              detailIcon={busyProvider === p.provider ? <Spinner /> : <ArrowRightIcon />}
            >
              <div>
                <img
                  alt={p.provider}
                  src={svgUrl(p.provider)}
                  className='cl-left-icon-wrapper'
                />
                Connect {p.name} wallet
              </div>
            </List.Item>
          ))}
        </List>
      </TitledCard>
    </>
  );
}
