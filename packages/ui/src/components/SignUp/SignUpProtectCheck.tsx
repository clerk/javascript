import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { withRedirectToAfterSignUp } from '../../common';
import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { Box, Button, Col, descriptors, Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

function SignUpProtectCheckInternal(): JSX.Element {
  const card = useCardState();
  const { t } = useLocalizations();
  const signUp = useCoreSignUp();
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const { afterSignUpUrl, navigateOnSetActive } = useSignUpContext();

  const { containerRef, isRunning, hasError, retry } = useProtectCheckRunner<SignUpResource>({
    getProtectCheck: () => signUp.protectCheck,
    getResource: () => signUp,
    reload: () => signUp.reload(),
    submitProtectCheck: params => signUp.submitProtectCheck(params),
    // Routes on the resolved resource. `completeSignUpFlow` handles the `complete` case (via
    // `handleComplete`) as well as routing to the next missing-field / verification / chained-
    // challenge step, so both the normal success and the `protect_check_already_resolved` reload
    // land correctly.
    onResolved: async (updatedSignUp, isCancelled) => {
      if (isCancelled()) {
        return;
      }
      await completeSignUpFlow({
        signUp: updatedSignUp,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        protectCheckPath: '.', // Self-navigate so a chained challenge re-runs this same route
        continuePath: '../continue',
        handleComplete: () =>
          setActive({
            session: updatedSignUp.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
            },
          }),
        navigate,
      });
    },
  });

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
            {isRunning && !hasError ? (
              <Box style={{ alignSelf: 'center' }}>{t(localizationKeys('signUp.protectCheck.loading'))}</Box>
            ) : null}
            {hasError ? (
              <Button
                onClick={retry}
                localizationKey={localizationKeys('signUp.protectCheck.retryButton')}
              />
            ) : null}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}

export const SignUpProtectCheck = withRedirectToAfterSignUp(withCardStateProvider(SignUpProtectCheckInternal));
