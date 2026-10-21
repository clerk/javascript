import { buildAccountsBaseUrl } from '@clerk/shared/buildAccountsBaseUrl';
import { ClerkRuntimeError, isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useSession } from '@clerk/shared/react';
import type { EnterpriseSSOFactor } from '@clerk/shared/types';
import React from 'react';

import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { useUserVerification } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useRouter } from '../../router';
import { useUserVerificationSession } from './useUserVerificationSession';

type UVFactorOneEnterpriseSSOCardProps = {
  factors: Array<EnterpriseSSOFactor & { enterpriseConnectionId: string; enterpriseConnectionName: string }>;
  onShowAlternativeMethodsClicked: React.MouseEventHandler | undefined;
};

const POPUP_CLOSED_CODE = 'reverification_popup_closed';

const waitForPopupCallback = (popup: Window, url: URL, accountsOrigin: string) =>
  new Promise<void>((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener('message', onMessage);
      clearInterval(interval);
      fn();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== accountsOrigin) {
        return;
      }
      if (event.data?.session || event.data?.return_url) {
        settle(resolve);
      }
    };
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        setTimeout(
          () =>
            settle(() => reject(new ClerkRuntimeError('Reverification popup was closed', { code: POPUP_CLOSED_CODE }))),
          1000,
        );
      }
    }, 500);

    window.addEventListener('message', onMessage);
    popup.location.href = url.href;
  });

export const UVFactorOneEnterpriseSSOCard = (props: UVFactorOneEnterpriseSSOCardProps) => {
  const { factors, onShowAlternativeMethodsClicked } = props;
  const clerk = useClerk();
  const { session } = useSession();
  const { data } = useUserVerificationSession();
  const { afterVerification } = useUserVerification();
  const { navigate } = useRouter();
  const card = useCardState();

  const completeVerification = async (): Promise<void> => {
    if (data?.level === 'multi_factor') {
      await navigate('./factor-two');
      return;
    }
    await clerk.setActive({ session: session?.id });
    afterVerification?.();
  };

  const verifyWithEnterpriseSSO = async (enterpriseConnectionId: string): Promise<void> => {
    if (!session) {
      return;
    }

    const popup = window.open('about:blank', '', 'width=600,height=800');
    const accountsOrigin = buildAccountsBaseUrl(clerk.frontendApi);
    const popupCallbackUrl = `${accountsOrigin}/popup-callback`;
    const currentUrl = window.location.href;

    const response = await session.prepareFirstFactorVerification({
      strategy: 'enterprise_sso',
      enterpriseConnectionId,
      redirectUrl: popup
        ? clerk.buildUrlWithAuth(`${popupCallbackUrl}?return_url=${encodeURIComponent(currentUrl)}`)
        : currentUrl,
      actionCompleteRedirectUrl: popup ? clerk.buildUrlWithAuth(popupCallbackUrl) : currentUrl,
    });

    const url = response.firstFactorVerification.externalVerificationRedirectURL;
    if (!url) {
      popup?.close();
      throw new ClerkRuntimeError('Missing external verification redirect URL', {
        code: 'external_verification_redirect_url_missing',
      });
    }

    if (!popup) {
      await clerk.navigate(url.href);
      return;
    }

    await waitForPopupCallback(popup, url, accountsOrigin);
    await completeVerification();
  };

  const handleSelectEnterpriseConnection = (enterpriseConnectionId: string) =>
    verifyWithEnterpriseSSO(enterpriseConnectionId).catch(err => {
      if (!isClerkRuntimeError(err) || err.code !== POPUP_CLOSED_CODE) {
        handleError(err, [], card.setError);
      }
      throw err;
    });

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
