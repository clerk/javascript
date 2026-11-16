'use client';

import type { ReactElement, ReactNode } from 'react';

import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { useErrorText, useMessages } from '../../localization';
import { useConsentController } from './consent.controller';
import type { ConsentModelOptions } from './consent.model';
import { useConsentModel } from './consent.model';
import { ConsentSkeleton } from './consent.skeleton';
import type { ConsentMessages, ConsentReadyModel } from './consent.types';
import { ConsentError, ConsentView } from './consent.view';

/** Everything `<Consent />` takes: which OAuth request to answer, and what to show while Clerk loads. */
export type ConsentProps = ConsentModelOptions & {
  /**
   * The element to render while Clerk loads.
   */
  fallback?: ReactNode;
};

/**
 * Asks the signed-in user whether an OAuth application may access their account. It reads the client,
 * scopes and redirect URI from the `client_id`, `scope` and `redirect_uri` URL parameters unless props
 * set them, and posts the answer to Clerk with every URL parameter forwarded. It renders `fallback`
 * until Clerk loads, a skeleton of the consent card until the consent details load, and nothing at all
 * when nobody is signed in.
 *
 * @example
 * ```tsx
 * import { Consent } from '@clerk/mosaic';
 *
 * <Consent />
 * ```
 *
 * @example
 * ```tsx
 * <Consent
 *   oauthClientId='client_123'
 *   scope='openid profile email'
 *   redirectUrl='https://app.example.com/oauth/callback'
 * />
 * ```
 */
export function Consent({ fallback, ...options }: ConsentProps): ReactElement | null {
  const messages = useMessages('consent');
  const errorText = useErrorText();
  const model = useConsentModel(options);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
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
              <ConsentSkeleton messages={messages} />
            </Flow.Step>
            <Flow.Step ids={['ready']}>
              {current.status === 'ready' ? (
                <ReadyConsent
                  model={current}
                  messages={messages}
                />
              ) : null}
            </Flow.Step>
            <Flow.Step ids={['error']}>
              {current.status === 'error' ? (
                <ConsentError message={errorText(current.error, messages.loadError)} />
              ) : null}
            </Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}

function ReadyConsent({ model, messages }: { model: ConsentReadyModel; messages: ConsentMessages }) {
  return <ConsentView {...useConsentController(model, messages)} />;
}
