import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';

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
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useRouter } from '../../router';

/**
 * Routes the user to the next step after a protect check has been resolved (or short-circuits
 * to the same route to handle a chained challenge).
 *
 * After the gate clears, the client should retry the operation that was gated.
 * For most steps (factor-one/factor-two cards), the underlying card uses `useFetch` to call
 * `prepareFirstFactor`/`prepareSecondFactor` on mount, so navigating back is sufficient to
 * re-trigger the gated work.
 */
function navigateNext(signIn: SignInResource, navigate: (to: string) => Promise<unknown>): Promise<unknown> {
  // Chained challenge — stay here and re-run the new challenge on next render. Both
  // signals are checked: `protectCheck` is the authoritative field, and
  // `'needs_protect_check'` is the SDK-version-gated status.
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
  const { afterSignInUrl, navigateOnSetActive } = useSignInContext();

  const { containerRef, isRunning, hasError, retry } = useProtectCheckRunner<SignInResource>({
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
      await navigateNext(updatedSignIn, navigate);
    },
  });

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
              style={{ display: 'block', alignSelf: 'center', minHeight: '60px' }}
            />
            {isRunning && !hasError ? (
              <Flex
                direction='col'
                center
                gap={4}
                aria-live='polite'
              >
                <Spinner
                  size='lg'
                  colorScheme='primary'
                  elementDescriptor={descriptors.spinner}
                />
                <Box>{t(localizationKeys('signIn.protectCheck.loading'))}</Box>
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
