'use client';

import type { ReactElement, ReactNode } from 'react';

import { useErrorText, useMessages } from '../../localization';
import { useOAuthConsentController } from './oauth-consent.controller';
import type { OAuthConsentModelOptions } from './oauth-consent.model';
import { useOAuthConsentModel } from './oauth-consent.model';
import type { OAuthConsentMessages, OAuthConsentReadyModel } from './oauth-consent.types';
import { OAuthConsentErrorView, OAuthConsentView } from './oauth-consent.view';

export interface OAuthConsentProps extends OAuthConsentModelOptions {
  /** Rendered while Clerk and the consent details load. */
  fallback?: ReactNode;
}

/**
 * Asks the signed-in user whether an OAuth application may access their account. It reads the client,
 * scopes and redirect URI from the `client_id`, `scope` and `redirect_uri` URL parameters unless props
 * set them, and posts the answer to Clerk with every URL parameter forwarded. It renders `fallback`
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
 *   fallback={<Spinner />}
 * />
 * ```
 */
export function OAuthConsent({ fallback, ...options }: OAuthConsentProps): ReactElement | null {
  const messages = useMessages('oauthConsent');
  const errorText = useErrorText();
  const model = useOAuthConsentModel(options);

  if (model.status === 'loading') {
    return <>{fallback ?? null}</>;
  }
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'error') {
    return <OAuthConsentErrorView message={errorText(model.error, messages.loadError)} />;
  }
  return (
    <ReadyOAuthConsent
      model={model}
      messages={messages}
    />
  );
}

function ReadyOAuthConsent({ model, messages }: { model: OAuthConsentReadyModel; messages: OAuthConsentMessages }) {
  return <OAuthConsentView {...useOAuthConsentController(model, messages)} />;
}
