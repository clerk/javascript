import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useUser } from '@clerk/shared/react';
import { useEffect } from 'react';

import { clerkInvalidFAPIResponse } from '../../../core/errors';
import type { GISCredentialResponse } from '../../../utils/one-tap';
import { loadGIS } from '../../../utils/one-tap';
import { useEnvironment, useGoogleOneTapContext } from '../../contexts';
import { Flow } from '../../customizables';
import { Card, useCardState, withCardStateProvider } from '../../elements';
import { CardAlert } from '../../elements/Card/CardAlert';
import { useFetch } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';

// TODO-ONETAP: Grab this from environment
const clientID = '466181446725-jqurtjvbts42erq1cjjf197ruevg19th.apps.googleusercontent.com';

function _OneTapStart(): JSX.Element {
  const clerk = useClerk();
  const { user } = useUser();
  const environment = useEnvironment();

  const supportEmail = useSupportEmail();
  const card = useCardState();
  const ctx = useGoogleOneTapContext();

  async function oneTapCallback(response: GISCredentialResponse) {
    try {
      const res = await clerk.client.signIn
        .create({
          // TODO-ONETAP: Add new types when feature is ready for public beta
          // @ts-expect-error
          strategy: 'google_one_tap',
          googleOneTapToken: response.credential,
        })
        .catch(err => {
          // throw err;
          if (isClerkAPIResponseError(err) && err.errors[0].code === 'resource_not_found') {
            // if (isClerkAPIResponseError(err) && err.errors[0].code === 'external_account_not_found') {
            return clerk.client.signUp.create({
              // TODO-ONETAP: Add new types when feature is ready for public beta
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
        // TODO-ONETAP: Add a new case in order to handle the `missing_requirements` status and the PSU flow
        default:
          clerkInvalidFAPIResponse(res.status, supportEmail);
          break;
      }
    } catch (err) {
      try {
        handleError(err, [], card.setError);
      } catch (e) {
        // In any other case simply log, this component is experimental and this flow is not handled on purpose
        console.error(e);
      }
    }
  }

  /**
   * Prevent GIS from initializing multiple times
   */
  const { data: google } = useFetch(user?.id ? undefined : loadGIS, 'google-identity-services-script', {
    onSuccess(google) {
      // TODO-ONETAP: Implement this
      // @ts-ignore
      const environmentClientID = environment.displayConfig.googleOneTapClientID;

      google.accounts.id.initialize({
        client_id: environmentClientID || clientID,
        callback: oneTapCallback,
        itp_support: true,
        cancel_on_tap_outside: ctx.cancelOnTapOutside,
        auto_select: false,
        use_fedcm_for_prompt: true,
      });

      google.accounts.id.prompt();
    },
  });

  useEffect(() => {
    if (google && !user?.id) {
      google.accounts.id.prompt();
    }
    return () => {
      if (google) {
        google.accounts.id.cancel();
      }
    };
  }, []);

  return (
    <Flow.Part part='start'>
      {/*// TODO-ONETAP: Improve error UI, currently there is no pattern for this case*/}
      {card.error && (
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
          <Card.Content>
            <CardAlert>{card.error}</CardAlert>
          </Card.Content>
        </Card.Root>
      )}
    </Flow.Part>
  );
}

export const OneTapStart = withCardStateProvider(_OneTapStart);
