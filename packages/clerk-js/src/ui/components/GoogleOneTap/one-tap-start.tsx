import { loadScript } from '@clerk/shared';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import { useEffect } from 'react';

import { clerkFailedToLoadThirdPartyScript, clerkInvalidFAPIResponse } from '../../../core/errors';
import { useEnvironment } from '../../contexts';
import { Flow } from '../../customizables';
import { Card, useCardState, withCardStateProvider } from '../../elements';
import { CardAlert } from '../../elements/Card/CardAlert';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';

const clientID = '466181446725-jqurtjvbts42erq1cjjf197ruevg19th.apps.googleusercontent.com';

declare global {
  export interface Window {
    google: any;
  }
}

export async function loadGIDS() {
  if (!window.google) {
    try {
      await loadScript('https://accounts.google.com/gsi/client', { defer: true });
      console.log('loading');
    } catch (_) {
      // Rethrow with specific message
      clerkFailedToLoadThirdPartyScript('Cloudflare Turnstile');
    }
  }
  return window.google;
}

function _OneTapStart(): JSX.Element {
  const clerk = useClerk();
  const environment = useEnvironment();

  const router = useRouter();
  const supportEmail = useSupportEmail();
  const card = useCardState();

  async function oneTapCallback(response: any) {
    try {
      const res = await clerk.client.signIn
        .create({
          // @ts-expect-error
          strategy: 'google_one_tap',
          googleOneTapToken: response.credential,
        })
        .catch(err => {
          if (isClerkAPIResponseError(err) && err.errors[0].code === 'resource_not_found') {
            // if (isClerkAPIResponseError(err) && err.errors[0].code === 'external_account_not_found') {
            return clerk.client.signUp.create({
              // @ts-expect-error
              strategy: 'google_one_tap',
              googleOneTapToken: response.credential,
            });
          }
          throw err;
        });

      switch (res.status) {
        case 'complete':
          await clerk.setActive({
            session: res.createdSessionId,
          });
          break;
        case 'missing_requirements':
          await router.navigate('psu');
          break;
        default:
          console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
          break;
      }
    } catch (err) {
      handleError(err, [], card.setError);
    }
  }

  const initializeGSI = () => {
    // @ts-ignore
    const environmentClientID = environment.displayConfig.googleOneTapClientID;
    console.log('environmentClientID', environmentClientID);

    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: environmentClientID || clientID,
        callback: oneTapCallback,
        // prompt_parent_id: 'one-tap',
        itp_support: true,
        // auto_select: true,
        use_fedcm_for_prompt: true,
      });

      // @ts-ignore
      window.google.accounts.id.prompt();
    }
  };

  useEffect(() => {
    // const script = document.createElement('script');
    // script.src = 'https://accounts.google.com/gsi/client';
    // script.onload = initializeGSI;
    // script.async = true;
    // document.querySelector('body').appendChild(script);
    loadGIDS().then(initializeGSI);

    return () => {
      // @ts-ignore
      window.google.accounts.id.cancel();
    };
  }, []);

  return (
    <Flow.Part part='start'>
      <Card.Root
        id={'one-tap'}
        sx={t => ({
          animation: `${animations.fadeIn} 150ms ${t.transitionTiming.$common}`,
          zIndex: t.zIndices.$modal,
          overflow: 'auto',
          width: 'fit-content',
          height: 'fit-content',
          position: 'fixed',
          right: 0,
          top: 0,
        })}
      >
        <CardAlert>{card.error}</CardAlert>
      </Card.Root>
    </Flow.Part>
  );
}

export const OneTapStart = withCardStateProvider(_OneTapStart);
