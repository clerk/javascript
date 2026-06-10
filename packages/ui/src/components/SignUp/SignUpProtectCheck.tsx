import { useClerk } from '@clerk/shared/react';
import type { SignUpProps, SignUpResource } from '@clerk/shared/types';
import type { ComponentType } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { withRedirectToAfterSignUp } from '../../common';
import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { Box, Button, Col, descriptors, Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

/**
 * Continuation paths default to the standalone `/sign-up/protect-check` mount. When the card is
 * mounted deeper (e.g. `continue/protect-check` or the combined-flow `create/.../protect-check`),
 * the nested route passes overrides so a resolved gate routes within the correct subtree instead
 * of dead-ending. The verify/self paths resolve correctly from every mount; only `continuePath`
 * differs (the `continue` index is `..`, not `../continue`, once we're already under `continue`).
 */
type SignUpProtectCheckProps = Partial<SignUpProps> & {
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  protectCheckPath?: string;
};

function SignUpProtectCheckInternal({
  verifyEmailPath = '../verify-email-address',
  verifyPhonePath = '../verify-phone-number',
  continuePath = '../continue',
  protectCheckPath = '.',
}: SignUpProtectCheckProps = {}): JSX.Element {
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
        verifyEmailPath,
        verifyPhonePath,
        protectCheckPath, // Defaults to '.' so a chained challenge re-runs this same route
        continuePath,
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

// The redirect HOC widens props back to the shared component-props union; re-expose the path
// overrides so nested route mounts (continue/protect-check, create/continue/protect-check) can
// pass them.
export const SignUpProtectCheck = withRedirectToAfterSignUp(
  withCardStateProvider(SignUpProtectCheckInternal),
) as ComponentType<SignUpProtectCheckProps>;
