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
import {
  isSignInPendingOAuthTransfer,
  isSignInProtectGated,
  resumeSignInAfterProtectCheck,
} from './handleProtectCheck';

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

  // persist the original status of whether the sign-in is pending an OAuth transfer
  const startedAsOAuthTransfer = useRef(isSignInPendingOAuthTransfer(signIn));

  // persist that a protect check existed at some point
  const [everSawProtectCheck, setEverSawProtectCheck] = useState(!!signIn.protectCheck);
  const didStartNoCheckFallbackRef = useRef(false);
  // 'none' | 'pending' | 'done' — one bounded reload for a gate signalled by status alone
  const [statusOnlyReload, setStatusOnlyReload] = useState<'none' | 'pending' | 'done'>('none');

  if (signIn.protectCheck && !everSawProtectCheck) {
    setEverSawProtectCheck(true);
  }

  useEffect(() => {
    if (signIn.protectCheck || everSawProtectCheck) {
      return;
    }
    // A gate signalled by `status: 'needs_protect_check'` without an inline `protectCheck`
    // payload is an in-progress, server-gated sign-in (e.g. gated on an OAuth callback
    // exchange) — reload to fetch the challenge; bouncing to the flow start would discard
    // the sign-in and force the user to restart.
    if (isSignInProtectGated(signIn) && statusOnlyReload === 'none') {
      setStatusOnlyReload('pending');
      void signIn
        .reload()
        .catch(() => {})
        .finally(() => setStatusOnlyReload('done'));
      return;
    }
    if (statusOnlyReload === 'pending') {
      return;
    }
    if (!didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [everSawProtectCheck, navigateToFlowStart, signIn, statusOnlyReload]);

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
        resumeOAuthContinuation: () =>
          typeof __internal_resumeAfterProtectCheck === 'function'
            ? __internal_resumeAfterProtectCheck(
                {
                  ...buildSignInOAuthCallbackParams(ctx),
                  continuation: 'transfer_to_sign_up',
                  __internal_navigateOnSetActive: ctx.navigateOnSetActive,
                },
                navigate,
              )
            : navigate('..'),
      });
    },
  });

  // Debounce the spinner's entrance so a near-instant check (or a script that signals its
  // widget immediately) never flashes it — the card header alone carries the first ~300ms.
  // The error and widget-visibility gates stay OUTSIDE the delay hook below: its minimum
  // visible duration must never outrank the handshake's "spinner is gone when the promise
  // resolves" guarantee, nor keep a spinner next to the retry button.
  const showSpinner = useSpinDelay(isRunning, { delay: 300 });

  // No challenge payload yet (stale/direct visit, or the status-only reload above is in
  // flight): render nothing while the flow-start redirect
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
