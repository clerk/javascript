import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import {
  buildPopupCallbackUrls,
  POPUP_CLOSED_ERROR_CODE,
  waitForPopupCallback,
} from '@clerk/shared/internal/clerk-js/popupCallback';
import { useClerk, useSession } from '@clerk/shared/react';
import type { EnterpriseSSOFactor } from '@clerk/shared/types';
import React from 'react';

import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';

import { useUserVerification } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useAfterVerification } from './use-after-verification';
import { useUserVerificationSession } from './useUserVerificationSession';

type EnterpriseConnectionFactor = EnterpriseSSOFactor & {
  enterpriseConnectionId: string;
  enterpriseConnectionName: string;
};

type UVFactorOneEnterpriseSSOCardProps = {
  factors: EnterpriseConnectionFactor[];
  onShowAlternativeMethodsClicked: React.MouseEventHandler | undefined;
};

export const UVFactorOneEnterpriseSSOCard = (props: UVFactorOneEnterpriseSSOCardProps) => {
  const { factors, onShowAlternativeMethodsClicked } = props;
  const clerk = useClerk();
  const { session } = useSession();
  const { data } = useUserVerificationSession();
  const { oauthFlow } = useUserVerification();
  const { handleVerificationResponse } = useAfterVerification();
  const card = useCardState();

  const emailAddressIdFor = (factor: EnterpriseConnectionFactor) => {
    const user = session?.user;
    const account = user?.enterpriseAccounts.find(
      account =>
        account.enterpriseConnectionId === factor.enterpriseConnectionId ||
        account.enterpriseConnection?.enterpriseConnectionId === factor.enterpriseConnectionId ||
        (account.provider === factor.enterpriseConnectionProvider &&
          account.enterpriseConnection?.name === factor.enterpriseConnectionName),
    );
    const domain = account?.enterpriseConnection?.domain?.toLowerCase();
    return (
      user?.emailAddresses.find(email => email.emailAddress === account?.emailAddress)?.id ??
      user?.emailAddresses.find(email => !!domain && email.emailAddress.toLowerCase().endsWith(`@${domain}`))?.id
    );
  };

  const verifyWithEnterpriseSSO = async (enterpriseConnectionId: string, popup: Window | null): Promise<void> => {
    const factor = factors.find(f => f.enterpriseConnectionId === enterpriseConnectionId);
    if (!session || !data || !factor) {
      throw new ClerkRuntimeError('There is no active session to verify', { code: 'reverification_session_missing' });
    }

    const currentUrl = window.location.href;
    const popupUrls = popup
      ? buildPopupCallbackUrls(clerk.frontendApi, url => clerk.buildUrlWithAuth(url), currentUrl)
      : null;

    const response = await session.prepareFirstFactorVerification({
      strategy: 'enterprise_sso',
      enterpriseConnectionId,
      emailAddressId: emailAddressIdFor(factor),
      redirectUrl: popupUrls?.redirectUrl ?? currentUrl,
      actionCompleteRedirectUrl: popupUrls?.redirectUrlComplete ?? currentUrl,
    });

    const url = response.firstFactorVerification.externalVerificationRedirectURL;
    if (!url) {
      throw new ClerkRuntimeError('Missing external verification redirect URL', {
        code: 'external_verification_redirect_url_missing',
      });
    }

    if (!popup || !popupUrls) {
      await clerk.navigate(url.href);
      return;
    }

    await waitForPopupCallback(popup, url.href, popupUrls.accountsOrigin);
    await session.reload();
    if (session.factorVerificationAge?.[0] !== 0) {
      throw new ClerkRuntimeError('Verification with your identity provider did not complete', {
        code: 'reverification_enterprise_sso_failed',
      });
    }

    await handleVerificationResponse({
      ...data,
      session,
      status: data.level === 'multi_factor' ? 'needs_second_factor' : 'complete',
    });
  };

  const handleSelectEnterpriseConnection = (enterpriseConnectionId: string) => {
    const usePopup = oauthFlow === 'redirect' ? false : oauthFlow === 'auto' ? originPrefersPopup() : true;
    const popup = usePopup ? window.open('about:blank', '', 'width=600,height=800') : null;
    return verifyWithEnterpriseSSO(enterpriseConnectionId, popup).catch(err => {
      popup?.close();
      if (isClerkAPIResponseError(err)) {
        card.setError(err.errors[0]);
      } else if (!isClerkRuntimeError(err) || err.code !== POPUP_CLOSED_ERROR_CODE) {
        handleError(err, [], card.setError);
      }
      throw err;
    });
  };

  return (
    <Flow.Part part='enterpriseConnections'>
      <ChooseEnterpriseConnectionCard
        title={localizationKeys('reverification.enterpriseSSO.title')}
        subtitle={localizationKeys('reverification.enterpriseSSO.subtitle')}
        onClick={handleSelectEnterpriseConnection}
        enterpriseConnections={factors.map(factor => ({
          id: factor.enterpriseConnectionId,
          name: factor.enterpriseConnectionName,
          logoPublicUrl: factor.enterpriseConnectionLogoPublicUrl,
          provider: factor.enterpriseConnectionProvider,
        }))}
        showLogo={false}
      >
        {onShowAlternativeMethodsClicked && (
          <Card.Action elementId='alternativeMethods'>
            <Card.ActionLink
              localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
              onClick={onShowAlternativeMethodsClicked}
            />
          </Card.Action>
        )}
      </ChooseEnterpriseConnectionCard>
    </Flow.Part>
  );
};
