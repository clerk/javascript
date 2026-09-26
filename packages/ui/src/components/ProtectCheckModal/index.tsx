import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { __internal_ProtectCheckModalProps, SignInResource, SignUpResource } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

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
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { Route, Switch } from '../../router';

const flowLocalizationKeys = {
  signIn: {
    title: localizationKeys('signIn.protectCheck.title'),
    subtitle: localizationKeys('signIn.protectCheck.subtitle'),
    loading: localizationKeys('signIn.protectCheck.loading'),
    retryButton: localizationKeys('signIn.protectCheck.retryButton'),
  },
  signUp: {
    title: localizationKeys('signUp.protectCheck.title'),
    subtitle: localizationKeys('signUp.protectCheck.subtitle'),
    loading: localizationKeys('signUp.protectCheck.loading'),
    retryButton: localizationKeys('signUp.protectCheck.retryButton'),
  },
};

const flowOf = (resource: SignInResource | SignUpResource) =>
  resource.pathRoot.endsWith('sign_ups') ? 'signUp' : 'signIn';

const ProtectCheckCard = withCardStateProvider(
  ({ resource, onResolved, onFailed }: __internal_ProtectCheckModalProps) => {
    const card = useCardState();
    const { t } = useLocalizations();
    const keys = flowLocalizationKeys[flowOf(resource)];

    const { containerRef, isRunning, isWidgetVisible, hasError, retry } = useProtectCheckRunner<
      SignInResource | SignUpResource
    >({
      getProtectCheck: () => resource.protectCheck,
      getResource: () => resource,
      reload: () => resource.reload(),
      submitProtectCheck: params =>
        resource.submitProtectCheck(params).catch((error: unknown) => {
          if (isClerkAPIResponseError(error) && error.errors[0]?.code === ERROR_CODES.FRAUD_ACTION_BLOCKED) {
            onFailed(error);
          }
          throw error;
        }),
      onResolved: (updated, isCancelled) => {
        if (!isCancelled() && !updated.protectCheck) {
          onResolved();
        }
        return Promise.resolve();
      },
    });

    const showSpinner = useSpinDelay(isRunning, { delay: 300 });

    return (
      <Flow.Part part='protectCheck'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={keys.title} />
              <Header.Subtitle localizationKey={keys.subtitle} />
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
                style={{ display: 'block', alignSelf: 'center', position: isWidgetVisible ? 'static' : 'absolute' }}
              />
              {showSpinner && !hasError && !isWidgetVisible ? (
                <Flex center>
                  <Spinner
                    size='lg'
                    colorScheme='primary'
                    elementDescriptor={descriptors.spinner}
                    aria-label={t(keys.loading)}
                  />
                </Flex>
              ) : null}
              {hasError ? (
                <Button
                  onClick={retry}
                  localizationKey={keys.retryButton}
                />
              ) : null}
            </Col>
          </Card.Content>
          <Card.Footer />
        </Card.Root>
      </Flow.Part>
    );
  },
);

function ProtectCheckModal(props: __internal_ProtectCheckModalProps): JSX.Element {
  return (
    <Route path='protect-check'>
      <Flow.Root flow='protectCheck'>
        <Switch>
          <Route index>
            <ProtectCheckCard {...props} />
          </Route>
        </Switch>
      </Flow.Root>
    </Route>
  );
}

ProtectCheckModal.displayName = 'ProtectCheckModal';

export { ProtectCheckModal };
