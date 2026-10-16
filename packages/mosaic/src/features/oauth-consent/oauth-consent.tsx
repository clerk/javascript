'use client';

import type { ReactElement } from 'react';

import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { useErrorText, useMessages } from '../../localization';
import { useOAuthConsentController } from './oauth-consent.controller';
import type { OAuthConsentModelOptions } from './oauth-consent.model';
import { useOAuthConsentModel } from './oauth-consent.model';
import type { OAuthConsentMessages, OAuthConsentReadyModel } from './oauth-consent.types';
import { OAuthConsentError, OAuthConsentPending, OAuthConsentView } from './oauth-consent.view';

export type OAuthConsentProps = OAuthConsentModelOptions;

/**
 * Asks the signed-in user whether an OAuth application may access their account. It reads the client,
 * scopes and redirect URI from the `client_id`, `scope` and `redirect_uri` URL parameters unless props
 * set them, and posts the answer to Clerk with every URL parameter forwarded. It shows a loading card
 * until the consent details load, and nothing at all when nobody is signed in.
 *
 * @example
 * ```tsx
 * import { OAuthConsent } from '@clerk/mosaic';
 *
 * <OAuthConsent />
 * ```
 *
 * @example
 * ```tsx
 * <OAuthConsent
 *   oauthClientId='client_123'
 *   scope='openid profile email'
 *   redirectUrl='https://app.example.com/oauth/callback'
 * />
 * ```
 */
export function OAuthConsent(options: OAuthConsentProps): ReactElement | null {
  const messages = useMessages('oauthConsent');
  const errorText = useErrorText();
  const model = useOAuthConsentModel(options);

  if (model.status === 'hidden') {
    return null;
  }
  return (
    <Card.Root renderBranding={model.status === 'ready' && model.renderBranding}>
      <Flow.Root
        value={model.status}
        state={model}
      >
        {current => (
          <>
            <Flow.Step ids={['loading']}>
              <OAuthConsentPending label={messages.loading} />
            </Flow.Step>
            <Flow.Step ids={['ready']}>
              {current.status === 'ready' ? (
                <ReadyOAuthConsent
                  model={current}
                  messages={messages}
                />
              ) : null}
            </Flow.Step>
            <Flow.Step ids={['error']}>
              {current.status === 'error' ? (
                <OAuthConsentError message={errorText(current.error, messages.loadError)} />
              ) : null}
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}

function ReadyOAuthConsent({ model, messages }: { model: OAuthConsentReadyModel; messages: OAuthConsentMessages }) {
  return <OAuthConsentView {...useOAuthConsentController(model, messages)} />;
}
