import React from 'react';
import { Spinner } from '@clerk/shared/components/spinner';
import {
  ExpiredMagicLinkWaitingScreen,
  FailedMagicLinkWaitingScreen,
  LoadingScreen,
  PoweredByClerk,
  VerifiedMagicLinkWaitingScreen,
  VerifiedSwitchTabMagicLinkWaitingScreen,
  Portal
} from 'ui/common';
import { VerificationStatus } from 'utils/getClerkQueryParam';

// UX - Don't confuse the user
// by showing many transitions at once
const waitForTransitions = (ms: number) => new Promise(r => setTimeout(r, ms));

export type MagicLinkVerificationStatusModalProps = {
  verificationStatus: VerificationStatus;
  successHeader?: string;
};

export function MagicLinkVerificationStatusModal({
  successHeader,
  verificationStatus,
}: MagicLinkVerificationStatusModalProps): JSX.Element {
  const [showModal, setShowModal] = React.useState(false);

  const showStatusModalAfterDelay = async () => {
    await waitForTransitions(550);
    setShowModal(true);
  };

  React.useEffect(() => {
    void showStatusModalAfterDelay();
  }, []);

  const spinner = !showModal && <Spinner className='cl-verify-page-spinner' />;

  const successModal = showModal && verificationStatus === 'verified' && (
    <div className='cl-verify-page-modal'>
      <VerifiedMagicLinkWaitingScreen header={successHeader} />
      <PoweredByClerk className='cl-verify-page-powered-by-clerk' />
    </div>
  );

  const expiredModal = showModal && verificationStatus === 'expired' && (
    <div className='cl-verify-page-modal'>
      <ExpiredMagicLinkWaitingScreen mainText='Return to the original tab to continue.' />
      <PoweredByClerk className='cl-verify-page-powered-by-clerk' />
    </div>
  );

  const genericErrorModal = showModal && verificationStatus === 'failed' && (
    <div className='cl-verify-page-modal'>
      <FailedMagicLinkWaitingScreen />
      <PoweredByClerk className='cl-verify-page-powered-by-clerk' />
    </div>
  );

  const switchTabModal = showModal &&
    verificationStatus === 'verified_switch_tab' && (
      <div className='cl-verify-page-modal'>
        <VerifiedSwitchTabMagicLinkWaitingScreen header={successHeader} />
        <PoweredByClerk className='cl-verify-page-powered-by-clerk' />
      </div>
    );

  return (
    <div>
      {/* Occupy some space so we dont break the users app
       by rendering nothing inside their components */}
      <LoadingScreen showHeader={false} />
      <Portal className='cl-component'>
        <div
          className='cl-verify-page-container'
          data-test-id='magicLink-verify-screen'
        >
          <div className='cl-verify-page-backdrop'>
            {spinner}
            {successModal}
            {expiredModal}
            {genericErrorModal}
            {switchTabModal}
          </div>
        </div>
      </Portal>
    </div>
  );
}
