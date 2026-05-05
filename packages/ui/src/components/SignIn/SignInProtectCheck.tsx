import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';

import { withRedirectToAfterSignIn } from '../../common';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { Box, Col, descriptors, Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';

/**
 * Routes the user to the next step after a protect check has been resolved (or short-circuits
 * to the same route to handle a chained challenge).
 *
 * Per spec §4.3: after the gate clears, the client should retry the operation that was gated.
 * For most steps (factor-one/factor-two cards), the underlying card uses `useFetch` to call
 * `prepareFirstFactor`/`prepareSecondFactor` on mount, so navigating back is sufficient to
 * re-trigger the gated work.
 */
function navigateNext(signIn: SignInResource, navigate: (to: string) => Promise<unknown>) {
  // Chained challenge — stay here and re-run the new challenge on next render. Both
  // signals are checked: `protectCheck` is the authoritative field per spec §5.1, and
  // `'needs_protect_check'` is the SDK-version-gated status from spec §2.2.2.
  if (signIn.protectCheck || signIn.status === 'needs_protect_check') {
    return navigate('.');
  }

  switch (signIn.status) {
    case 'needs_first_factor':
      return navigate('../factor-one');
    case 'needs_second_factor':
      return navigate('../factor-two');
    case 'needs_client_trust':
      return navigate('../client-trust');
    case 'needs_new_password':
      return navigate('../reset-password');
    case 'complete':
      // Finalization is handled by the caller via setActive; just bounce to index.
      return navigate('..');
    default:
      return navigate('..');
  }
}

function SignInProtectCheckInternal(): JSX.Element {
  const card = useCardState();
  const { t } = useLocalizations();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const ctx = useSignInContext();
  const { afterSignInUrl, navigateOnSetActive } = ctx;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isRunningRef = React.useRef(false);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    const protectCheck = signIn.protectCheck;
    if (!protectCheck || isRunningRef.current) {
      return;
    }

    // Cancellation: if the component unmounts (route change, navigation away) or the
    // dependency changes (chained challenge with a new protectCheck reference), abort
    // any in-flight script execution and skip downstream state updates.
    const abortController = new AbortController();
    let cancelled = false;

    // Per spec §5.1.4: do not attempt to solve an expired challenge.
    // Reload the resource so the server can mint a fresh challenge before re-routing,
    // otherwise the local stale `signIn.protectCheck` would re-trigger this same effect
    // and loop indefinitely with no user feedback.
    if (protectCheck.expiresAt !== undefined && protectCheck.expiresAt < Date.now()) {
      isRunningRef.current = true;
      setIsRunning(true);
      void (async () => {
        try {
          await signIn.reload();
        } catch (err: any) {
          if (!cancelled) {
            handleError(err, [], card.setError);
          }
        } finally {
          if (!cancelled) {
            isRunningRef.current = false;
            setIsRunning(false);
          }
        }
      })();
      return () => {
        cancelled = true;
        abortController.abort();
        isRunningRef.current = false;
      };
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);

    const finalizeIfComplete = async (updatedSignIn: SignInResource) => {
      if (cancelled) {
        return false;
      }
      if (updatedSignIn.status === 'complete' && updatedSignIn.createdSessionId) {
        await setActive({
          session: updatedSignIn.createdSessionId,
          navigate: async ({ session, decorateUrl }) => {
            await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
          },
        });
        return true;
      }
      return false;
    };

    const runChallenge = async () => {
      try {
        const proofToken = await executeProtectCheck(protectCheck, container, {
          signal: abortController.signal,
        });
        if (cancelled) {
          return;
        }

        let updatedSignIn: SignInResource;
        try {
          updatedSignIn = await signIn.submitProtectCheck({ proofToken });
        } catch (err) {
          if (cancelled) {
            return;
          }
          // Per spec §3.3, §5.3.4: protect_check_already_resolved is retry-safe.
          // Reload to clear the stale local protectCheck; otherwise navigateNext would
          // see protectCheck still set and self-loop on this route.
          if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
            await signIn.reload();
            if (cancelled) {
              return;
            }
            await navigateNext(signIn, navigate);
            return;
          }
          throw err;
        }
        if (cancelled) {
          return;
        }

        if (await finalizeIfComplete(updatedSignIn)) {
          return;
        }

        if (cancelled) {
          return;
        }
        await navigateNext(updatedSignIn, navigate);
      } catch (err: any) {
        if (cancelled) {
          return;
        }
        handleError(err, [], card.setError);
      } finally {
        if (!cancelled) {
          isRunningRef.current = false;
          setIsRunning(false);
        }
      }
    };

    void runChallenge();

    return () => {
      cancelled = true;
      abortController.abort();
      // Reset the guard so the next mount / dep-change can re-run; this is what makes
      // chained challenges work correctly across re-renders.
      isRunningRef.current = false;
    };
  }, [signIn.protectCheck]);

  return (
    <Flow.Part part='protectCheck'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.protectCheck.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.protectCheck.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Box
              ref={containerRef}
              id='clerk-protect-check'
              style={{ display: 'block', alignSelf: 'center', minHeight: '60px' }}
            />
            {isRunning && !card.error ? (
              <Box style={{ alignSelf: 'center' }}>{t(localizationKeys('signIn.protectCheck.loading'))}</Box>
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}

export const SignInProtectCheck = withRedirectToAfterSignIn(withCardStateProvider(SignInProtectCheckInternal));
