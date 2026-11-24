'use client';

import type { ReactElement, ReactNode } from 'react';

import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import type { MosaicOptions } from '../../hooks/use-mosaic-options';
import { MosaicOptionsProvider } from '../../hooks/use-mosaic-options';
import { useErrorText, useMessages } from '../../localization';
import { useOAuthConsentController } from './oauth-consent.controller';
import type { OAuthConsentModelOptions } from './oauth-consent.model';
import { useOAuthConsentModel } from './oauth-consent.model';
import { OAuthConsentSkeleton } from './oauth-consent.skeleton';
import type { OAuthConsentMessages, OAuthConsentReadyModel } from './oauth-consent.types';
import { OAuthConsentError, OAuthConsentView } from './oauth-consent.view';

/** Everything `<OAuthConsent />` takes: which OAuth request to answer, and what to show while Clerk loads. */
export type OAuthConsentProps = OAuthConsentModelOptions & {
  /** How this component looks. Overrides `options` on `MosaicProvider` key by key; see `MosaicOptions`. */
  options?: MosaicOptions;
  /**
   * The element to render while Clerk loads.
   */
  fallback?: ReactNode;
};

/**
 * Asks the signed-in user whether an OAuth application may access their account. It reads the client,
 * scopes and redirect URI from the `client_id`, `scope` and `redirect_uri` URL parameters unless props
 * set them, and posts the answer to Clerk with the scopes the user kept checked and the other URL
 * parameters forwarded. It renders `fallback`
 * until Clerk loads, a skeleton of the consent card until the consent details load, and nothing at all
 * when nobody is signed in.
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
export function OAuthConsent({ fallback, options, ...modelOptions }: OAuthConsentProps): ReactElement | null {
  const messages = useMessages('oauthConsent');
  const errorText = useErrorText();
  const model = useOAuthConsentModel(modelOptions);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <MosaicOptionsProvider options={options}>
      <Card.Root
        align='center'
        renderBranding={model.status !== 'error' && model.renderBranding}
      >
        <Flow.Root
          value={model.status}
          state={model}
        >
          {current => (
            <>
              <Flow.Step ids={['fetching']}>
                <OAuthConsentSkeleton messages={messages} />
              </Flow.Step>
              <Flow.Step ids={['ready']}>
                {current.status === 'ready' ? (
                  <ReadyOAuthConsent
                    key={`${current.actionUrl} ${current.scopes.map(item => item.scope).join(' ')}`}
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
    </MosaicOptionsProvider>
  );
}

function ReadyOAuthConsent({ model, messages }: { model: OAuthConsentReadyModel; messages: OAuthConsentMessages }) {
  return <OAuthConsentView {...useOAuthConsentController(model, messages)} />;
}
