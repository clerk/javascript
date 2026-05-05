import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';
import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';

import { withRedirectToAfterSignUp } from '../../common';
import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { Box, Col, descriptors, Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

function SignUpProtectCheckInternal(): JSX.Element {
  const card = useCardState();
  const { t } = useLocalizations();
  const signUp = useCoreSignUp();
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const ctx = useSignUpContext();
  const { afterSignUpUrl, navigateOnSetActive } = ctx;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isRunningRef = React.useRef(false);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    const protectCheck = signUp.protectCheck;
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
    // otherwise the local stale `signUp.protectCheck` would re-trigger this same effect
    // and loop indefinitely with no user feedback.
    if (protectCheck.expiresAt !== undefined && protectCheck.expiresAt < Date.now()) {
      isRunningRef.current = true;
      setIsRunning(true);
      void (async () => {
        try {
          await signUp.reload();
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

    const continueAfter = async (resource = signUp) => {
      if (cancelled) {
        return;
      }
      await completeSignUpFlow({
        signUp: resource,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        protectCheckPath: '.', // Self-navigate handles chained challenges (spec §3.2b, §4.2)
        continuePath: '../continue',
        handleComplete: () =>
          setActive({
            session: resource.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
            },
          }),
        navigate,
      });
    };

    const runChallenge = async () => {
      try {
        const proofToken = await executeProtectCheck(protectCheck, container, {
          signal: abortController.signal,
        });
        if (cancelled) {
          return;
        }

        let updatedSignUp;
        try {
          updatedSignUp = await signUp.submitProtectCheck({ proofToken });
        } catch (err) {
          if (cancelled) {
            return;
          }
          // Per spec §3.3, §5.3.4: protect_check_already_resolved is retry-safe.
          // The server's resource state has moved past this gate; reload to pick up the
          // fresh state, then continue routing based on the actual current status rather
          // than stale local data.
          if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
            await signUp.reload();
            if (cancelled) {
              return;
            }
            await continueAfter();
            return;
          }
          throw err;
        }
        if (cancelled) {
          return;
        }
        await continueAfter(updatedSignUp);
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
  }, [signUp.protectCheck]);

  return (
    <Flow.Part part='protectCheck'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signUp.protectCheck.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signUp.protectCheck.subtitle')} />
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
              <Box style={{ alignSelf: 'center' }}>{t(localizationKeys('signUp.protectCheck.loading'))}</Box>
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}

export const SignUpProtectCheck = withRedirectToAfterSignUp(withCardStateProvider(SignUpProtectCheckInternal));
