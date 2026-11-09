'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SignInWithMetamaskButton } from '@clerk/mosaic/features/sign-in-with-metamask-button/sign-in-with-metamask-button';
import { useMosaicEnvironment } from '@clerk/mosaic/hooks/use-mosaic-environment';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk } from '@clerk/nextjs';

import { LivePageHeader } from '../../../live-page-header';

export default function SignInWithMetamaskButtonLivePage() {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const enabled = environment?.userSettings.web3FirstFactors.includes('web3_metamask_signature');

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Sign in with MetaMask button'>
          Signs in for real with the MetaMask browser extension and returns here. Sign out first to see the full flow.
        </LivePageHeader>
        {clerk.loaded && !enabled ? (
          <p className='rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm'>
            MetaMask is not a sign-in strategy for this application, so the button renders nothing. Turn on Web3 wallets
            with MetaMask in the Clerk Dashboard.
          </p>
        ) : null}
        <div>
          <SignInWithMetamaskButton
            redirectUrl='/live/misc/sign-in-with-metamask-button'
            render={<Button />}
          />
        </div>
      </div>
    </MosaicProvider>
  );
}
