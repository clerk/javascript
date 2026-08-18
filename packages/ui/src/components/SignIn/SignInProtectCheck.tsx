import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { withRedirectToAfterSignIn } from '../../common';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  localizationKeys,
  Spinner,
  useLocalizations,
} from '../../customizables';
import { useSpinDelay } from '../../hooks';
import { useNavigateToFlowStart } from '../../hooks/useNavigateToFlowStart';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useRouter } from '../../router';
import { buildSignInOAuthCallbackParams } from './buildOAuthCallbackParams';
import { isSignInPendingOAuthTransfer, resumeSignInAfterProtectCheck } from './handleProtectCheck';

function SignInProtectCheckInternal(): JSX.Element | null {
  const card = useCardState();
  const { t } = useLocalizations();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const clerk = useClerk();
  const { setActive, __internal_resumeAfterProtectCheck } = clerk;
  const ctx = useSignInContext();
  const { afterSignInUrl, navigateOnSetActive } = ctx;

  // Latched at mount, BEFORE the challenge is submitted. `SignIn.fromJSON` replaces
  // `firstFactorVerification` wholesale on every write, so the transferable marker that routed
  // us here is not guaranteed to survive `submitProtectCheck` — and it is the only thing that
  // distinguishes "an OAuth sign-up is in progress" from "an ordinary gated sign-in".
  const startedAsOAuthTransfer = useRef(isSignInPendingOAuthTransfer(signIn));

  // Latches that a protect check existed at some point, so the resolution race
  // (submitProtectCheck clearing protectCheck mid-navigation) isn't mistaken for a stale
  // visit. Mirrors SignUpProtectCheck, which has had this since it shipped. State adjusted
  // during render (guarded) rather than a ref write, which React disallows in the render body.
  const [everSawProtectCheck, setEverSawProtectCheck] = useState(!!signIn.protectCheck);
  const didStartNoCheckFallbackRef = useRef(false);

  if (signIn.protectCheck && !everSawProtectCheck) {
    setEverSawProtectCheck(true);
  }

  useEffect(() => {
    if (!signIn.protectCheck && !everSawProtectCheck && !didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [everSawProtectCheck, navigateToFlowStart, signIn.protectCheck]);

  const { containerRef, isRunning, isWidgetVisible, hasError, retry } = useProtectCheckRunner<SignInResource>({
    getProtectCheck: () => signIn.protectCheck,
    getResource: () => signIn,
    reload: () => signIn.reload(),
    submitProtectCheck: params => signIn.submitProtectCheck(params),
    // Routes on the resolved resource. This single path finalizes `complete` from both the normal
    // success and the `protect_check_already_resolved` reload, so neither strands the user with an
    // unactivated session.
    onResolved: async (updatedSignIn, isCancelled) => {
      if (isCancelled()) {
        return;
      }
      if (updatedSignIn.status === 'complete' && updatedSignIn.createdSessionId) {
        await setActive({
          session: updatedSignIn.createdSessionId,
          navigate: async ({ session, decorateUrl }) => {
            await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
          },
        });
        return;
      }
      await resumeSignInAfterProtectCheck(updatedSignIn, {
        navigate,
        startedAsOAuthTransfer: startedAsOAuthTransfer.current,
        // No isCancelled() guard around this one: completing the transfer calls setActive,
        // which flips the withRedirectToAfterSignIn guard and blanks this card. That unmount
        // must not abort the continuation — the router owns its navigation from here.
        resumeOAuthContinuation: () =>
          __internal_resumeAfterProtectCheck(
            { ...buildSignInOAuthCallbackParams(ctx), continuation: 'transfer_to_sign_up' },
            navigate,
          ),
      });
    },
  });

  // Debounce the spinner's entrance so a near-instant check (or a script that signals its
  // widget immediately) never flashes it — the card header alone carries the first ~300ms.
  // The error and widget-visibility gates stay OUTSIDE the delay hook below: its minimum
  // visible duration must never outrank the handshake's "spinner is gone when the promise
  // resolves" guarantee, nor keep a spinner next to the retry button.
  const showSpinner = useSpinDelay(isRunning, { delay: 300 });

  // Stale/direct visit that never had a check: render nothing while the flow-start redirect
  // scheduled above kicks in, instead of flashing the card shell for one paint. Must stay
  // below every hook call.
  if (!signIn.protectCheck && !everSawProtectCheck) {
    return null;
  }

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
              aria-busy={isRunning}
              // Out of flow while empty so the collapsed container adds no reserved height or flex-gap
              // gutter above the spinner (same idiom as CaptchaElement's `gapless` mode).
              style={{ display: 'block', alignSelf: 'center', position: isWidgetVisible ? 'static' : 'absolute' }}
            />
            {showSpinner && !hasError && !isWidgetVisible ? (
              <Flex center>
                <Spinner
                  size='lg'
                  colorScheme='primary'
                  elementDescriptor={descriptors.spinner}
                  aria-label={t(localizationKeys('signIn.protectCheck.loading'))}
                />
              </Flex>
            ) : null}
            {hasError ? (
              <Button
                onClick={retry}
                localizationKey={localizationKeys('signIn.protectCheck.retryButton')}
              />
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}

export const SignInProtectCheck = withRedirectToAfterSignIn(withCardStateProvider(SignInProtectCheckInternal));
